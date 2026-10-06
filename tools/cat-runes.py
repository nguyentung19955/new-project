#!/usr/bin/env python3
"""Cắt bảng 12 Ấn Phù (lưới 4×3, nền hồng tím) thành assets/runes/<mã ấn>.png (96 px).

  python3 tools/cat-runes.py <ảnh.png> nui|gio|sam
Thứ tự ô (trái→phải, trên→dưới) theo đúng thứ tự RUNES của nhánh đó trong js/data.js.
"""
import os, sys, re, importlib.util
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('cs', os.path.join(here, 'cat-sheet.py'))
cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)
spec2 = importlib.util.spec_from_file_location('ci', os.path.join(here, 'cat-icons.py'))
ci = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(ci)

def rune_ids(br):
    src = open(os.path.join(here, '..', 'js', 'data.js'), encoding='utf-8').read()
    return re.findall(r"\{ id: '(\w+)', br: '%s'" % br, src)

def main():
    src, br = sys.argv[1], sys.argv[2]
    ids = rune_ids(br)
    if len(ids) != 12: sys.exit(f'Nhánh {br} có {len(ids)} ấn, cần 12')
    sheet = cs.key_magenta(Image.open(src).convert('RGB'))
    W, H = sheet.size
    xs = cs.cut_lines(sheet, 4, W, axis=0); ys = cs.cut_lines(sheet, 3, H, axis=1)
    out = os.path.join(here, '..', 'assets', 'runes'); os.makedirs(out, exist_ok=True)
    for i, rid in enumerate(ids):
        c, r = i % 4, i // 4
        cell = cs.drop_specks(cs.drop_lines(sheet.crop((xs[c] + 4, ys[r] + 4, xs[c + 1] - 4, ys[r + 1] - 4))))
        cell = ci.clean_mark(cell)
        bb = cell.getbbox()
        if not bb: sys.exit(f'Ô {rid} trống')
        cell = cell.crop(bb); side = int(max(cell.size) * 1.04)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(cell, ((side - cell.width) // 2, (side - cell.height) // 2))
        cs.save_light(sq.resize((96, 96), Image.LANCZOS), os.path.join(out, f'{rid}.png'))
    print(f'Đã cắt 12 ấn nhánh {br}: {", ".join(ids)}')

if __name__ == '__main__':
    main()
