#!/usr/bin/env python3
"""Cắt một tấm icon (1 hàng × 4–5 ô, nền hồng tím) thành từng file theo tools/item-sheets.json (128 px).

  python3 tools/cat-items.py <ảnh.png> <mã tấm>      vd. do-riu, bo-son-tinh, phu-kien-1, ui-tran-4, de-tuong, cong-thanh
  Kết cấu đường (duong-nuoc, duong-dat…): không xoá nền, chỉ cắt vuông 512 px → assets/tiles/duong-<loại>.jpg
Mã tấm và tên file từng ô do tools/build-prompts.js sinh ra (đúng thứ tự ô trong prompt).
"""
import os, sys, json, importlib.util
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(here, file))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
cs = load('cs', 'cat-sheet.py')
ci = load('ci', 'cat-icons.py')

def main():
    src, code = sys.argv[1], sys.argv[2]
    sheets = json.load(open(os.path.join(here, 'item-sheets.json'), encoding='utf8'))
    if code not in sheets: sys.exit(f'Không có tấm {code}. Có: {", ".join(sheets)}')
    files = sheets[code]['files']; n = len(files)
    out = os.path.join(here, '..', 'assets', sheets[code]['dir']); os.makedirs(out, exist_ok=True)
    if sheets[code].get('texture'):
        # kết cấu lặp (đường quái đi, v156): không xoá nền, chỉ đưa về hình vuông N px và lưu JPG
        side = sheets[code]['texture']; im = Image.open(src).convert('RGB')
        s = min(im.size); im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
        im.resize((side, side), Image.LANCZOS).save(os.path.join(out, files[0]), quality=86, optimize=True)
        print(f"{code}: {files[0]}"); return
    sheet = cs.key_magenta(Image.open(src).convert('RGB'))
    W, H = sheet.size
    xs = cs.cut_lines(sheet, n, W, axis=0)
    for i, f in enumerate(files):
        ins = 8
        c = ci.clean_mark(cs.drop_specks(cs.drop_lines(sheet.crop((xs[i] + ins, ins, xs[i + 1] - ins, H - ins)))))
        bb = c.getbbox()
        if not bb: sys.exit(f'Ô {i + 1} ({f}) trống')
        c = c.crop(bb); side = int(max(c.size) * 1.08)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(c, ((side - c.width) // 2, (side - c.height) // 2))
        cs.save_light(sq.resize((128, 128), Image.LANCZOS), os.path.join(out, f))
    print(f"{code}: {', '.join(files)}")

if __name__ == '__main__':
    main()
