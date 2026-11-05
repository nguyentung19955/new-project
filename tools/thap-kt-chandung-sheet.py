#!/usr/bin/env python3
# Ghép bảng soát chân dung (gọi từ tools/thap-kt-chandung.js): mỗi chỗ chứa 1 khối, mỗi ô = ảnh chụp thật + đường MẮT (đỏ) + ĐỈNH TÓC (xanh lá)
# + khung cửa sổ ảnh (vàng mảnh); ô lỗi viền đỏ dày. Đường kẻ chỉ là chú thích soát lỗi, không phải hình trong game.
import json, sys, math
from PIL import Image, ImageDraw, ImageFont
J, OUT = sys.argv[1], sys.argv[2]
SACH = sys.argv[3] if len(sys.argv) > 3 else None   # bảng sạch (không vạch chú thích) để đặt cạnh mẫu DCDW
d = json.load(open(J)); rows = d['rows']; loi = d['loi']
bad = {}
for l in loi:
    c, rest = l.split(' ', 1); bad.setdefault((c, rest.split(':')[0]), []).append(l)
TH = 128   # chiều cao 1 ô
COLS = 22
ORDER0 = ['roster', 'slot', 'slot_mv', 'tray', 'cmd', 'inspect', 'summary', 'quick', 'partner', 'detail', 'commander']
ORDER = sorted(rows, key=lambda c: (ORDER0.index(c.split('@')[0]) if c.split('@')[0] in ORDER0 else 99, c))
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11); FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: F = FB = ImageFont.load_default()
blocks = []; sach = []
for c in ORDER:
    ds = rows.get(c)
    if not ds: continue
    tiles = []; stiles = []
    for r in ds:
        im = Image.open(r['file']).convert('RGB')
        bw, bh = r['box'][2], r['box'][3]
        s = im.height / bh  # px ảnh / px css
        h = TH if c not in ('detail', 'commander') else TH * 2
        k = h / im.height
        im = im.resize((max(1, round(im.width * k)), h), Image.LANCZOS)
        st = Image.new('RGB', (im.width + 6, im.height + 6), (20, 22, 26)); st.paste(im, (3, 3)); stiles.append(st)
        dr = ImageDraw.Draw(im)
        w = r['win']; X, Y, Wd, Hd = [v * s * k for v in (w['x'], w['y'], w['w'], w['h'])]
        dr.rectangle([X, Y, X + Wd - 1, Y + Hd - 1], outline=(255, 220, 0))
        ye = Y + r['mat'] * Hd; yt = Y + r['toc'] * Hd
        dr.line([X, ye, X + Wd, ye], fill=(255, 40, 40), width=1)
        dr.line([X, yt, X + Wd, yt], fill=(40, 255, 80), width=1)
        if r.get('cam') is not None: yc = Y + r['cam'] * Hd; dr.line([X, yc, X + Wd, yc], fill=(60, 140, 255), width=1)
        xm = X + r['x'] * Wd; dr.line([xm - 4, ye, xm + 4, ye], fill=(255, 255, 255), width=2)
        tile = Image.new('RGB', (im.width + 6, im.height + 20), (20, 22, 26))
        tile.paste(im, (3, 3))
        td = ImageDraw.Draw(tile)
        if (c, r['id']) in bad: td.rectangle([0, 0, tile.width - 1, tile.height - 1], outline=(255, 0, 0), width=3)
        td.text((3, im.height + 5), r['id'][:14], fill=(230, 230, 230) if (c, r['id']) not in bad else (255, 90, 90), font=F)
        tiles.append(tile)
    tw = max(t.width for t in tiles); th = max(t.height for t in tiles)
    cols = max(1, min(len(tiles), (2400 // tw)))
    nr = math.ceil(len(tiles) / cols)
    B = Image.new('RGB', (cols * tw, nr * th + 30), (12, 14, 18)); bd = ImageDraw.Draw(B)
    nb = sum(1 for (cc, _) in bad if cc == c)
    bd.text((6, 5), f'{c.upper()}  ·  {len(ds)} ảnh  ·  {"0 lỗi" if not nb else str(nb) + " LỖI"}   (đỏ = mắt · xanh lá = đỉnh tóc · xanh dương = cằm · vàng = cửa sổ ảnh)', fill=(255, 255, 255) if not nb else (255, 90, 90), font=FB)
    for i, t in enumerate(tiles): B.paste(t, ((i % cols) * tw, 30 + (i // cols) * th))
    blocks.append(B)
    sw = max(t.width for t in stiles); sh = max(t.height for t in stiles); sc = max(1, min(len(stiles), 1200 // sw)); snr = math.ceil(len(stiles) / sc)
    SB = Image.new('RGB', (sc * sw, snr * sh + 30), (12, 14, 18)); sd = ImageDraw.Draw(SB); sd.text((6, 5), c.upper(), fill=(255, 255, 255), font=FB)
    for i, t in enumerate(stiles): SB.paste(t, ((i % sc) * sw, 30 + (i // sc) * sh))
    sach.append(SB)
W = max(b.width for b in blocks); H = sum(b.height for b in blocks) + 10 * len(blocks)
S = Image.new('RGB', (W, H), (0, 0, 0)); y = 0
for b in blocks: S.paste(b, (0, y)); y += b.height + 10
S.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(OUT, optimize=True)  # bảng màu 256 → nhẹ ~1/4
print('bảng:', OUT, S.size)

if SACH:
    W = max(b.width for b in sach); H = sum(b.height for b in sach) + 10 * len(sach)
    S2 = Image.new('RGB', (W, H), (0, 0, 0)); y = 0
    for b in sach: S2.paste(b, (0, y)); y += b.height + 10
    S2.save(SACH, quality=88) if SACH.endswith('.jpg') else S2.save(SACH, optimize=True)
    print('bảng sạch:', SACH, S2.size)
