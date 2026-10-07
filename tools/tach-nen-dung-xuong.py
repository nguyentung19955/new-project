"""Tách nền hồng / magenta cho ảnh DỰNG XƯƠNG (docs/PROMPT-DUNG-XUONG.txt) → assets/<mã>.png nền trong suốt.

Cách chạy:  python3 tools/tach-nen-dung-xuong.py <file .zip | thư mục ảnh> [assets] [--xem anh-xem.png] [--boc-vien-trang kinhduong,...]
Cần: pip install pillow numpy scipy
- Tên ảnh = mã nhân vật (thoren.png, trieuda.png…) — ảnh có tên lạ vẫn tách nhưng in cảnh báo.
- Nền: vùng màu hồng / tím (đỏ và lam cao hơn lục) nối với mép ảnh, kể cả bóng đổ hồng sẫm dưới chân;
  viền nét đậm của nhân vật chặn loang nên phần hồng TRONG nhân vật (rồng hồng, áo hồng) được giữ.
  Lỗ nền kín (khe giữa hai chân, giữa tay và thân) bỏ đi nếu cùng màu nền.
- Cắt sát (lề 2%), thu nhỏ còn tối đa 512 px (game chỉ dùng ~256 px); viền mềm 1 px, khử ám hồng ở mép.
- Sau khi chép vào assets/ nhớ chạy: node tools/build-asset-list.js
"""
import io, os, re, sys, zipfile
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

MAX_SIDE = 512


def known_codes():
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'PROMPT-DUNG-XUONG.txt')
    try:
        return set(re.findall(r'^Tên file: ([\w-]+)\.png', open(p, encoding='utf-8').read(), re.M))
    except OSError:
        return set()


def bg_model(a):
    """màu nền chuyển sắc: khớp mặt bậc 2 theo (x, y) từ dải viền ảnh, từng kênh màu"""
    h, w = a.shape[:2]
    m = max(4, int(min(h, w) * 0.015))
    ys, xs = np.mgrid[0:h, 0:w]
    ring = np.zeros((h, w), bool); ring[:m] = ring[-m:] = True; ring[:, :m] = ring[:, -m:] = True
    X, Y = xs / w - 0.5, ys / h - 0.5
    feats = lambda X, Y: np.stack([np.ones_like(X), X, Y, X * X, Y * Y, X * Y], -1)
    F = feats(X[ring], Y[ring])
    model = np.zeros_like(a, dtype=np.float64)
    for c in range(3):
        v = a[..., c][ring].astype(np.float64)
        for _ in range(2):   # bỏ điểm lệch (nhân vật chạm mép) rồi khớp lại
            coef, *_ = np.linalg.lstsq(F, v, rcond=None)
            res = np.abs(F @ coef - v); ok = res < max(12, np.percentile(res, 90))
            coef, *_ = np.linalg.lstsq(F[ok], v[ok], rcond=None)
        model[..., c] = feats(X, Y) @ coef
    return model


def cut(img, peel_white=False):
    a = np.asarray(img.convert('RGB')).astype(np.int32)
    model = bg_model(a)
    af = a.astype(np.float64)
    # nền = gần màu nền tại chỗ đó; bóng đổ = màu nền tối đi (cùng sắc, độ sáng 40–100%)
    f = (af * model).sum(2) / np.maximum(1, (model * model).sum(2))
    res = np.sqrt(((af - model * f[..., None]) ** 2).sum(2))
    near = np.sqrt(((af - model) ** 2).sum(2)) < 48
    shade = (f > 0.4) & (f < 1.06) & (res < 26)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    dark_pink = (r - g > 45) & (b - g > 8) & (af.sum(2) < 0.88 * model.sum(2))   # bóng đổ hồng sẫm dưới chân
    def flood(cand):
        lab, n = ndimage.label(cand)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        return np.isin(lab, list(edge))
    bg = flood(near | shade)
    if not bg.any():
        return None
    # bóng đổ hồng sẫm: chỉ xét dải sát đáy nhân vật (12% chiều cao), để không ăn vào nhân vật màu hồng
    rows = np.where((~bg).any(1))[0]
    if len(rows):
        y1 = rows.max(); y0 = int(y1 - (y1 - rows.min()) * 0.12)
        band = np.zeros_like(bg); band[y0:] = True
        bg = flood(bg | (dark_pink & band))
    # lỗ nền kín (khe giữa hai chân, giữa tay và thân): rất sát màu nền, đủ lớn
    tight = np.sqrt(((af - model) ** 2).sum(2)) < 30
    # (nhân vật màu hồng — nhiều mảng trùng màu nền — thì bỏ bước này, thà sót khe giữa chân còn hơn thủng thân)
    lab3, n3 = ndimage.label(tight & ~bg)
    if n3 and (tight & ~bg).sum() > (~bg).sum() * 0.06:
        n3 = 0
    if n3:
        s3 = ndimage.sum(np.ones_like(lab3), lab3, index=np.arange(1, n3 + 1))
        big = [i + 1 for i, sz in enumerate(s3) if sz >= a.shape[0] * a.shape[1] * 0.0006]
        if big:
            bg |= np.isin(lab3, big)
    # viền: nở nền 1 px (ăn phần pha hồng ở mép), alpha mềm
    fg = ~ndimage.binary_dilation(bg, iterations=1)
    fg = ndimage.binary_opening(fg, iterations=2)   # bỏ vệt mảnh (mép bóng đổ)
    # bỏ mảnh vụn rời (hạt lấp lánh nhỏ cách xa nhân vật)
    lab2, n2 = ndimage.label(fg)
    if n2 > 1:
        s2 = ndimage.sum(fg, lab2, index=np.arange(1, n2 + 1))
        keep = np.isin(lab2, [i + 1 for i, s in enumerate(s2) if s >= s2.max() * 0.004])
        fg &= keep
    if peel_white:
        # bóc viền trắng kiểu sticker (vd kinhduong): gọt dần các điểm trắng / xám nhạt nằm ở mép ngoài, tối đa ~1,5% cạnh ảnh
        white = (a.min(2) > 200) & (a.max(2) - a.min(2) < 45)
        for _ in range(max(4, int(max(a.shape[:2]) * 0.015))):
            edge = fg & ~ndimage.binary_erosion(fg)
            rm = edge & white
            if not rm.any():
                break
            fg &= ~rm
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    al = np.asarray(alpha).astype(np.int32)
    al[~fg] = np.minimum(al[~fg], 140)
    rgb = a.copy()
    # khử ám hồng ở mép: điểm nửa trong suốt kéo màu về điểm tối gần nhất trong nhân vật
    soft = (al > 0) & (al < 255)
    if soft.any():
        blur = np.stack([ndimage.grey_erosion(a[..., i], size=3) for i in range(3)], -1)
        rgb[soft] = blur[soft]
    out = np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    bb = im.getbbox()
    if not bb:
        return None
    pad = int(max(im.size) * 0.02)
    bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))
    im = im.crop(bb)
    k = MAX_SIDE / max(im.size)
    if k < 1:
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    return im


def inputs(src):
    if src.lower().endswith('.zip'):
        z = zipfile.ZipFile(src)
        for n in z.namelist():
            if n.lower().endswith(('.png', '.webp', '.jpg', '.jpeg')) and not n.startswith('__MACOSX'):
                yield os.path.basename(n), Image.open(io.BytesIO(z.read(n)))
    else:
        for n in sorted(os.listdir(src)):
            if n.lower().endswith(('.png', '.webp', '.jpg', '.jpeg')):
                yield n, Image.open(os.path.join(src, n))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(1)
    src, dst = args[0], (args[1] if len(args) > 1 else 'assets')
    xem = sys.argv[sys.argv.index('--xem') + 1] if '--xem' in sys.argv else None
    # --boc-vien-trang ma1,ma2: bóc viền trắng sticker cho các mã này
    peel = set(sys.argv[sys.argv.index('--boc-vien-trang') + 1].split(',')) if '--boc-vien-trang' in sys.argv else set()
    args = [x for x in args if x not in (xem,) and not (peel and x == ','.join(sorted(peel)))]
    codes = known_codes()
    done = []
    for name, img in inputs(src):
        code = os.path.splitext(name)[0]
        if codes and code not in codes:
            print('  ! tên lạ (không có trong docs/PROMPT-DUNG-XUONG.txt):', name)
        out = cut(img, peel_white=code in peel)
        if out is None:
            print('  ✗ không tìm thấy nền hồng:', name)
            continue
        os.makedirs(dst, exist_ok=True)
        out.save(os.path.join(dst, code + '.png'), optimize=True)
        done.append((code, out))
        print(f'  ✓ {code}.png  {out.width}×{out.height}')
    if xem and done:
        # tấm xem nhanh: mỗi ảnh trên nền ca-rô để thấy chỗ sót nền
        cw = 180
        rows = (len(done) + 9) // 10
        sheet = Image.new('RGB', (cw * min(10, len(done)), (cw + 16) * rows), (40, 52, 36))
        tile = Image.new('RGB', (16, 16), (60, 78, 52))
        for y in range(0, sheet.height, 16):
            for x in range((y // 16) % 2 * 16, sheet.width, 32):
                sheet.paste(tile, (x, y))
        for i, (code, im) in enumerate(done):
            k = (cw - 10) / max(im.size)
            t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
            x0, y0 = (i % 10) * cw + (cw - t.width) // 2, (i // 10) * (cw + 16) + cw - t.height - 4
            sheet.paste(t, (x0, y0), t)
        sheet.save(xem)
        print('  tấm xem:', xem)
    print(f'Xong {len(done)} ảnh → {dst}/ (nhớ chạy: node tools/build-asset-list.js)')


if __name__ == '__main__':
    main()
