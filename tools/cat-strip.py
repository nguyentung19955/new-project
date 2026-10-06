#!/usr/bin/env python3
"""Cắt dải khung hình chuyển động (1 hàng × N ô, mặc định 4) thành từng khung cho game.

  python3 tools/cat-strip.py <ảnh.png> <mã> <động tác> [số ô]
  ví dụ: python3 tools/cat-strip.py lactuong-attack.png lactuong attack

Động tác: idle · attack · cast (tướng) · walk · attack · skill (quái / boss).
Ra assets/packs/<mã>/<động tác>_1.png … _N.png. Các khung cắt chung một khung dọc (đỉnh cao nhất → chân thấp nhất)
và căn giữa theo tâm khối hình, nên ghép lại không bị nhảy. Nền hồng tím / chữ / vạch kẻ được xoá như tools/cat-sheet.py.
"""
import os, sys, importlib.util
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('cs', os.path.join(here, 'cat-sheet.py'))
cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)

def main():
    src, code, anim = sys.argv[1], sys.argv[2], sys.argv[3]
    n = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    raw = Image.open(src).convert('RGB')
    r0, g0, b0 = raw.getpixel((raw.width // 2, 3))
    sheet = cs.key_magenta(cs.wipe_labels(raw, n, 1)) if (r0 > 180 and b0 > 180 and g0 < 90) else cs.key_border(raw)
    W, H = sheet.size
    xs = cs.cut_lines(sheet, n, W, axis=0)
    ins = 6
    cells = [cs.drop_specks(cs.drop_lines(sheet.crop((xs[i] + ins, ins, xs[i + 1] - ins, H - ins)))) for i in range(n)]
    boxes = [c.getbbox() for c in cells]
    if not all(boxes): sys.exit('Có ô trống — kiểm tra lại ảnh')
    top = min(b[1] for b in boxes); bot = max(b[3] for b in boxes)
    # căn ngang theo tâm khối hình (trọng tâm điểm ảnh), cùng bề rộng cho mọi khung
    cx = []
    for c in cells:
        a = np.asarray(c)[..., 3] > 20
        cx.append(int(np.nonzero(a.any(0))[0].mean()))
    half = max(max(cx[i] - boxes[i][0], boxes[i][2] - cx[i]) for i in range(n))
    out = os.path.join(here, '..', 'assets', 'packs', code); os.makedirs(out, exist_ok=True)
    hh = min(480, bot - top)
    for i, c in enumerate(cells):
        fr = Image.new('RGBA', (half * 2, bot - top), (0, 0, 0, 0))
        fr.alpha_composite(c.crop((max(0, cx[i] - half), top, min(c.width, cx[i] + half), bot)), (max(0, half - cx[i]), 0))
        k = hh / fr.height
        fr = fr.resize((max(1, round(fr.width * k)), hh), Image.LANCZOS)
        cs.save_light(fr, os.path.join(out, f'{anim}_{i + 1}.png'))
        print(f'{anim}_{i + 1}', fr.size)
    # khung đầu dùng làm ảnh tĩnh nếu chưa có
    legacy = {'idle': 'idle', 'walk': 'walk1'}.get(anim)
    if legacy and not os.path.exists(os.path.join(out, legacy + '.png')):
        Image.open(os.path.join(out, f'{anim}_1.png')).save(os.path.join(out, legacy + '.png'))
    print('Xong. Thêm', repr(code), 'vào bảng FRAME_ANIMS trong js/render.js.')

if __name__ == '__main__':
    main()
