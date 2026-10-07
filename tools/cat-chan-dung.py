"""Cắt CHÂN DUNG (đầu + vai) từ ảnh dựng xương assets/<mã>.png → assets/chan-dung-moi/<mã>.png (cao 240 px, như packs/<mã>/head.png).

Cách chạy:  python3 tools/cat-chan-dung.py [mã …] [--xem tam-xem.png]
  không ghi mã: cắt mọi mã có trong docs/PROMPT-DUNG-XUONG.txt có ảnh assets/<mã>.png, trừ CD_SKIP (js/tu-cu-dong.js).
Sau đó chạy: node tools/build-asset-list.js
Cách cắt: lấy phần trên ~60% chiều cao hình (đầu chibi + mũ + vai), căn giữa theo tâm khối đầu (trung vị cột có hình ở dải 18–50%),
rộng ≈ cao, bỏ lề trong suốt; mã nào lệch thì chỉnh trong CHINH bên dưới (tỉ lệ cao, lệch ngang).
"""
import os, re, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'chan-dung-moi')
H_OUT = 240
# chỉnh riêng: mã → (tỉ lệ cao vùng cắt so với hình, lệch ngang theo bề rộng vùng cắt)
CHINH = {}


def codes():
    txt = open(os.path.join(ROOT, 'docs', 'PROMPT-DUNG-XUONG.txt'), encoding='utf-8').read()
    all_ = re.findall(r'^Tên file: ([\w-]+)\.png', txt, re.M)
    js = open(os.path.join(ROOT, 'js', 'tu-cu-dong.js'), encoding='utf-8').read()
    m = re.search(r'const CD_SKIP = new Set\(\[(.*?)\]\)', js, re.S)
    skip = set(re.findall(r"'([\w-]+)'", m.group(1))) if m else set()
    return [c for c in all_ if c not in skip and os.path.exists(os.path.join(ROOT, 'assets', c + '.png'))], skip


def cut(im, code):
    a = np.asarray(im.convert('RGBA'))
    al = a[..., 3] > 40
    ys, xs = np.where(al)
    y0, y1 = ys.min(), ys.max()
    hh = y1 - y0 + 1
    kh, dx = CHINH.get(code, (0.6, 0.0))
    ch = int(hh * kh)
    # tâm khối đầu: trung vị cột có hình trong dải 18–50% (bỏ ngọn mũ / sừng / vũ khí giơ cao ở đỉnh)
    band = al[y0 + int(hh * 0.18): y0 + int(hh * 0.5)]
    cols = np.where(band.any(0))[0]
    w = band.sum(0)
    cum = np.cumsum(w)
    cx = int(np.searchsorted(cum, cum[-1] / 2)) if cum[-1] else int(xs.mean())
    cw = int(ch * 1.0)
    cx += int(dx * cw)
    box = (max(0, cx - cw // 2), y0, min(a.shape[1], cx + cw // 2), y0 + ch)
    out = im.convert('RGBA').crop(box)
    bb = out.getbbox()
    if bb:
        # giữ đáy (vai bị cắt ngang ở đáy), chỉ bỏ lề trong suốt trái / phải / trên
        out = out.crop((bb[0], bb[1], bb[2], out.height))
    k = H_OUT / out.height
    return out.resize((max(1, round(out.width * k)), H_OUT), Image.LANCZOS)


def main():
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    xem = sys.argv[sys.argv.index('--xem') + 1] if '--xem' in sys.argv else None
    args = [x for x in args if x != xem]
    allc, skip = codes()
    todo = args or allc
    os.makedirs(OUT, exist_ok=True)
    done = []
    for c in todo:
        if c in skip:
            print('  - bỏ qua (CD_SKIP, chờ gen lại):', c)
            continue
        im = Image.open(os.path.join(ROOT, 'assets', c + '.png'))
        out = cut(im, c)
        out.save(os.path.join(OUT, c + '.png'), optimize=True)
        done.append((c, out))
    print(f'Xong {len(done)} chân dung → assets/chan-dung-moi/ (nhớ chạy: node tools/build-asset-list.js)')
    if xem and done:
        cw, chh = 130, 150
        cols = 12
        sheet = Image.new('RGB', (cw * cols, chh * ((len(done) + cols - 1) // cols)), (40, 52, 36))
        for i, (c, im) in enumerate(done):
            k = min((cw - 6) / im.width, (chh - 6) / im.height)
            t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
            sheet.paste(t, ((i % cols) * cw + (cw - t.width) // 2, (i // cols) * chh + chh - t.height - 3), t)
        sheet.save(xem)
        print('  tấm xem:', xem)


if __name__ == '__main__':
    main()
