#!/usr/bin/env python3
"""Cắt ảnh hiệu ứng gen theo docs/PROMPT-HIEU-UNG.txt vào game.

  python3 tools/cat-fx.py hat <ảnh> <tên1> … <tênN> [--mau]   tấm N ô vuông một hàng → assets/fx/<tên>.png
        mặc định: ảnh hạt trắng xám trên nền đen → PNG xám có kênh trong suốt (độ sáng = độ đặc, như Kenney), 256 px;
        --mau: giữ màu, nền hồng tím (đạn bay phần D) → assets/fx/<tên>.png 128 px
  python3 tools/cat-fx.py dai <ảnh> <tên>                     dải N khung vuông nằm ngang → assets/vfx/<tên>.png (cao 192 px)
  python3 tools/cat-fx.py don <ảnh> <tên>                     một vật trên nền hồng tím → assets/<tên>.png (cắt sát, cao tối đa 256 px)

Nền tự nhận theo màu góc ảnh: đen → độ trong suốt lấy theo độ sáng (hiệu ứng phát sáng giữ viền mềm);
hồng tím #FF00FF → xoá nền như tools/cat-sheet.py. CAT_FX_OUT=<thư mục> thay cho assets/ (dùng cho test)."""
import importlib.util, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.environ.get('CAT_FX_OUT') or os.path.join(HERE, '..', 'assets')
_spec = importlib.util.spec_from_file_location('cat_sheet', os.path.join(HERE, 'cat-sheet.py'))
cat_sheet = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(cat_sheet)


def nen(raw):
    """'black' hoặc 'magenta' theo trung vị màu dải viền ảnh."""
    a = np.asarray(raw.convert('RGB')).astype(int)
    b = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    r, g, bl = np.median(b, axis=0)
    return 'magenta' if r > 150 and bl > 150 and g < 100 else 'black'


def xoa_den(im, xam=False):
    """Nền đen → trong suốt. Độ đặc = độ sáng (trừ mức đen của nền); màu chia lại cho độ đặc để không bị tối viền."""
    a = np.asarray(im.convert('RGB')).astype(np.float64)
    lv = np.percentile(a.max(-1), 5)                  # mức "đen" thật của nền (AI hay ra đen hơi xám)
    if xam:
        lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2] - lv) / max(1, 255 - lv)
        v = (np.clip(lum, 0, 1) * 255).round().astype(np.uint8)
        return Image.fromarray(np.dstack([v, v]), 'LA')
    al = np.clip((a.max(-1) - lv) / max(1, 255 - lv), 0, 1)
    rgb = np.clip(a / np.maximum(al[..., None], 1e-3), 0, 255)
    rgb[al < 0.02] = 0
    return Image.fromarray(np.dstack([rgb, al * 255]).round().astype(np.uint8), 'RGBA')


def bo_nen(raw, xam=False):
    if nen(raw) == 'magenta':
        im = cat_sheet.key_magenta(raw.convert('RGB'))
        return im.convert('LA') if xam else im
    return xoa_den(raw, xam)


def bo_dau(im):
    """Dấu ✦ của Gemini ở góc dưới phải ảnh: xoá."""
    a = np.asarray(im).copy(); wm = max(24, im.width // 40)
    a[-wm:, -wm:, -1] = 0
    return Image.fromarray(a, im.mode)


def cat_o(im, n):
    W, H = im.size; cw = W / n; ins = max(2, int(cw * 0.02))
    return [im.crop((round(i * cw) + ins, ins, round((i + 1) * cw) - ins, H - ins)) for i in range(n)]


def hat(src, names, mau=False):
    raw = Image.open(src)
    im = bo_dau(bo_nen(raw, xam=not mau))
    out = os.path.join(ASSETS, 'fx'); os.makedirs(out, exist_ok=True)
    size = 128 if mau else 256
    for name, c in zip(names, cat_o(im, len(names))):
        if mau:   # đạn: cắt sát rồi đặt giữa ô vuông
            bb = c.getbbox()
            if bb: c = c.crop(bb)
            s = max(c.size); sq = Image.new(c.mode, (s, s)); sq.paste(c, ((s - c.width) // 2, (s - c.height) // 2)); c = sq
        c = c.resize((size, size), Image.LANCZOS)
        c.save(os.path.join(out, name + '.png'), optimize=True)
        print(name, c.size, c.mode)


def dai(src, name):
    raw = Image.open(src)
    W, H = raw.size
    n = max(1, round(W / H))
    im = bo_dau(bo_nen(raw))
    hh = min(192, H)
    cells = [c.resize((hh, hh), Image.LANCZOS) for c in cat_o(im.crop((0, 0, round(n * H), H)) if W >= n * H else im, n)]
    out = Image.new('RGBA', (n * hh, hh))
    for i, c in enumerate(cells): out.paste(c, (i * hh, 0))
    d = os.path.join(ASSETS, 'vfx'); os.makedirs(d, exist_ok=True)
    out.save(os.path.join(d, name + '.png'), optimize=True)
    print(name, n, 'khung', out.size)


def don(src, name):
    im = bo_dau(bo_nen(Image.open(src)))
    im = cat_sheet.drop_specks(im)
    bb = im.getbbox()
    if not bb: sys.exit('ảnh trống: ' + src)
    im = im.crop(bb)
    if im.height > 256: im = im.resize((max(1, round(im.width * 256 / im.height)), 256), Image.LANCZOS)
    os.makedirs(ASSETS, exist_ok=True)
    cat_sheet.save_light(im, os.path.join(ASSETS, name + '.png'))
    print(name, im.size)


def main(argv):
    mau = '--mau' in argv
    argv = [x for x in argv if x != '--mau']
    if len(argv) < 3 or argv[0] not in ('hat', 'dai', 'don'): sys.exit(__doc__)
    mode, src = argv[0], argv[1]
    if mode == 'hat': hat(src, argv[2:], mau)
    elif mode == 'dai': dai(src, argv[2])
    else: don(src, argv[2])
    print('Nhớ tăng phiên bản game (CLAUDE.md).')


if __name__ == '__main__':
    main(sys.argv[1:])
