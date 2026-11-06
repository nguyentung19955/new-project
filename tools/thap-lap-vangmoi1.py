#!/usr/bin/env python3
"""TURRET MERGE — LẮP ẢNH ChatGPT cho 4 ụ vàng mới đợt 1 (CAN-VE-1.json) từ docs/demo-hop-tuong/thap-art/:
  raw_u3_<id>.png → đầu ụ (tools/thap-dau-u3.py: <id>_nong.png + nho/<id>.png + HEAD_K/ART_META) · glyph/<id>.png
  raw_pt_<id>.png → pilot_<id>.png 427 · pn/pilot_<id>.png 256 · hero/hero_<id>.jpg (≤1170×1020, không phóng quá tấm gốc)
  raw_fx_<id>.png (lưới 4×4) → assets/fx_<id>_sk.png = 1 hàng 16 khung (nền trong suốt, khoá magenta tách trộn)
Chạy: python3 tools/thap-lap-vangmoi1.py [id ...] — in ra id nào đã lắp phần nào (để sửa VM1.TAM / VM1.FXCO trong vangmoi1.js)."""
import importlib.util, os, subprocess, sys
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art'); A = os.path.join(GOC, 'thap', 'assets')
sp = importlib.util.spec_from_file_location('u2', os.path.join(GOC, 'tools', 'thap-dau-u2.py')); U2 = importlib.util.module_from_spec(sp); sp.loader.exec_module(U2)
IDS = sys.argv[1:] or ['lualien', 'hopca', 'luutru', 'xuonganh']
NEN = (13, 12, 18)  # nền tối như các chân dung vàng hiện có
FW = 320            # cỡ 1 khung hiệu ứng


def la_magenta(rgb):
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    return (r > 180) & (b > 180) & (g < 90)


for id_ in IDS:
    xong = []
    raw = os.path.join(ART, 'raw_u3_%s.png' % id_)
    if os.path.exists(raw):
        for f in [os.path.join(A, id_ + '_nong.png'), os.path.join(A, 'nho', id_ + '.png')]:
            if os.path.exists(f): os.remove(f)  # bản tạm (sao ảnh ụ khác) — không cất _v2old
        subprocess.check_call([sys.executable, os.path.join(GOC, 'tools', 'thap-dau-u3.py'), id_])
        ic = Image.open(os.path.join(A, 'nho', id_ + '.png')).convert('RGBA')
        U2.thu(ic, 128).save(os.path.join(A, 'glyph', id_ + '.png'))
        xong.append('dau')
    raw = os.path.join(ART, 'raw_pt_%s.png' % id_)
    if os.path.exists(raw):
        im = Image.open(raw).convert('RGB'); a = np.asarray(im)
        if la_magenta(a).mean() > 0.05:  # nền magenta → khoá tách trộn (không viền hồng) rồi đặt lên nền tối
            out, al = U2.khoa(a); al = al[..., None]
            a = (out * al + np.array(NEN, float) * (1 - al)).clip(0, 255).astype(np.uint8)
        im = Image.fromarray(a); W, H = im.size
        s = min(W, H); vu = im.crop(((W - s) // 2, 0, (W - s) // 2 + s, s))
        vu.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_' + id_ + '.png'))
        vu.resize((256, 256), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_' + id_ + '.png'))
        hw = min(W, int(H * 1170 / 1020)); hh = int(hw * 1020 / 1170)
        he = im.crop(((W - hw) // 2, 0, (W - hw) // 2 + hw, hh))
        if hw > 1170: he = he.resize((1170, 1020), Image.LANCZOS)
        he.save(os.path.join(A, 'hero', 'hero_' + id_ + '.jpg'), quality=90)
        xong.append('chandung')
    raw = os.path.join(ART, 'raw_fx_%s.png' % id_)
    if os.path.exists(raw):
        im = Image.open(raw).convert('RGB'); rgb = np.asarray(im)
        out, al = U2.khoa(rgb)
        rg = Image.fromarray(np.dstack([out.astype(np.uint8), (np.clip(al, 0, 1) * 255).astype(np.uint8) if al.max() <= 1.01 else al.astype(np.uint8)]), 'RGBA')
        W, H = rg.size; cw, ch = W // 4, H // 4
        dai = Image.new('RGBA', (FW * 16, FW), (0, 0, 0, 0))
        for i in range(16):
            o = rg.crop(((i % 4) * cw, (i // 4) * ch, (i % 4 + 1) * cw, (i // 4 + 1) * ch))
            k = min(cw, ch); o = o.crop(((cw - k) // 2, (ch - k) // 2, (cw - k) // 2 + k, (ch - k) // 2 + k))
            dai.paste(U2.thu(o, FW), (i * FW, 0))
        dai.save(os.path.join(A, 'fx_' + id_ + '_sk.png'), optimize=True)
        xong.append('fx')
    print(id_, xong or '—')
