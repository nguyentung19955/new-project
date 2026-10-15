#!/usr/bin/env python3
"""Ảnh soát TĨNH xem-bia.png (KHÔNG chạy game): màn hình chính trên ảnh bìa, dựng lại đúng bố cục js/village.js (TL_BIA) + js/bia.js
(khung đầu Ken Burns phóng 1,03, elip tối sau logo, dải tối trên / dưới, phủ cả lề ngoài khung 16:9), với ảnh giao diện thật của game
(gd-trong-dong, gd-logo, gd-nut-chinh, gd-nut-thuong, gd-khung-bang trong game/art/custom) — 2 bìa × VI/EN × 3 cỡ màn
(ngang 19,5:9 điện thoại, 4:3 máy tính bảng, dọc = game xoay 90°) + Bảng vàng mở trên màn chính (2 bìa × VI/EN).
Trạng thái vẽ: lưu mây có, đang là khách (nút "Chơi ngay" + "Đăng nhập Google" + "Bảng vàng" + dòng thông tin 2 dòng) — trạng thái đông chữ nhất.
Chữ đo bằng DejaVu Sans (máy dựng không có Be Vietnam Pro); ghi bề rộng chữ so với ô để soát tràn. Không vẽ đom đóm / ánh nước (động).

  python3 docs/review/ke-hoach-cai-thien/bia-moi/dung-xem-bia.py
"""
import base64
import io
import json
import os
import re

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
GAME = os.path.join(ROOT, 'game')
K = 2  # khung game 480×270 vẽ ở 960×540
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BIA = ['bia-1-cay-da', 'bia-2-dong-song']
TXT, GOLD = (241, 230, 198), (246, 220, 146)


def en_bang():
    """Bảng dịch tiếng Anh: chuỗi "vi": "en" trong ngon_ngu_en.js và ngon_ngu.js."""
    out = {}
    for f in ('ngon_ngu_en.js', 'ngon_ngu.js'):
        s = open(os.path.join(GAME, 'js', f), encoding='utf-8').read()
        for m in re.finditer(r'''^\s*(["'])(.+?)\1\s*:\s*(["'])(.+?)\3\s*,?\s*$''', s, re.M):
            out.setdefault(m.group(2), m.group(4))
    return out


EN = en_bang()


def tr(s, lg):
    return s if lg == 'vi' else EN.get(s, s)


def gd(ma):
    d = json.load(open(os.path.join(GAME, 'art', 'custom', ma + '.sprite.json'), encoding='utf-8'))
    return Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA'), d


def bo_cuc():
    s = open(os.path.join(GAME, 'js', 'village.js'), encoding='utf-8').read()
    m = re.search(r'const TL_BIA = (\{.*?\});', s)
    j = re.sub(r'(\w+):', r'"\1":', m.group(1))
    return json.loads(j)


TL = bo_cuc()


def chin_manh(ma, w, h):
    """Ảnh khung 9 mảnh (vien [t, r, b, l] theo đơn vị game) co giãn ra w×h đơn vị game, cỡ K."""
    im, d = gd(ma)
    net = d.get('net', 1)
    t, r, b, l = d.get('vien', [8, 8, 8, 8])
    sw, sh = im.size
    W, H = int(w * K), int(h * K)
    # thu viền cho vừa khi ô thấp (như khungVeDeu)
    k = min(1.0, H / ((t + b) * K), W / ((l + r) * K))
    out = Image.new('RGBA', (W, H))
    sx = [0, l * net, sw - r * net, sw]
    sy = [0, t * net, sh - b * net, sh]
    dx = [0, round(l * K * k), W - round(r * K * k), W]
    dy = [0, round(t * K * k), H - round(b * K * k), H]
    for i in range(3):
        for j in range(3):
            if sx[i + 1] <= sx[i] or sy[j + 1] <= sy[j] or dx[i + 1] <= dx[i] or dy[j + 1] <= dy[j]:
                continue
            p = im.crop((sx[i], sy[j], sx[i + 1], sy[j + 1])).resize((dx[i + 1] - dx[i], dy[j + 1] - dy[j]), Image.LANCZOS)
            out.paste(p, (dx[i], dy[j]))
    return out


def chu(dr, s, x, y, size, bold=False, fill=TXT, anchor='ms', bong=True):
    f = ImageFont.truetype(FONTB if bold else FONT, round(size * K))
    if bong:
        dr.text((x * K + 1, y * K + 1), s, font=f, fill=(0, 0, 0, 200), anchor=anchor)
    dr.text((x * K, y * K), s, font=f, fill=fill, anchor=anchor)
    return f.getlength(s) / K


def rong(s, size, bold=False):
    return ImageFont.truetype(FONTB if bold else FONT, round(size * K)).getlength(s) / K


def wrap(s, w, size):
    lines, cur = [], ''
    for wd in s.split(' '):
        t = cur + ' ' + wd if cur else wd
        if cur and rong(t, size) > w:
            lines.append(cur); cur = wd
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def man(bia, lg, mx, my, bang=False, bao=None):
    """Một màn: khung game 480×270 + lề mx, my (đơn vị game) mỗi bên. Trả ảnh RGB (480+2mx)×(270+2my) × K."""
    W, H = int((480 + 2 * mx) * K), int((270 + 2 * my) * K)
    ox, oy = int(mx * K), int(my * K)
    out = Image.new('RGBA', (W, H), (18, 13, 16, 255))
    im = Image.open(os.path.join(GAME, 'art', 'bia', bia + '.webp')).convert('RGBA')
    s = 1.03
    im = im.resize((int(480 * K * s), int(270 * K * s)), Image.LANCZOS)
    cx, cy = (im.width - 480 * K) // 2, (im.height - 270 * K) // 2
    out.paste(im.crop((cx, cy, cx + 480 * K, cy + 270 * K)), (ox, oy))
    # lớp tối (js/bia.js veMan) — vẽ theo từng hàng
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(lay)
    # dải trên: -my → 40 : 0,45 → 0
    for yy in range(0, oy + 40 * K):
        gy = yy / K - my
        a = 0.45 * (1 - (gy + my) / (40 + my))
        dr.line([(0, yy), (W, yy)], fill=(8, 6, 10, int(255 * max(0, a))))
    # dải dưới: 166 → 270 (0 / 0,5 @ 20% / 0,66 @ 45% / 0,8), lề dưới 0,8
    st = [(0, 0), (0.2, 0.5), (0.45, 0.66), (1, 0.8)]
    for yy in range(oy + 166 * K, H):
        gy = yy / K - my
        p = min(1, (gy - 166) / 104)
        for (p0, a0), (p1, a1) in zip(st, st[1:]):
            if p0 <= p <= p1:
                a = a0 + (a1 - a0) * (p - p0) / (p1 - p0)
                break
        dr.line([(0, yy), (W, yy)], fill=(8, 6, 10, int(255 * a)))
    out = Image.alpha_composite(out, lay)
    # elip tối sau logo: tâm (240, 58), bán kính 150 × 60 (scale 1 : 0,4), 0,55 → 0,32 @ 60% → 0
    el = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ep = el.load()
    for yy in range(max(0, oy + int(-2 * K)), min(H, oy + int(120 * K))):
        for xx in range(max(0, ox + 90 * K), min(W, ox + 390 * K)):
            gx, gy = (xx - ox) / K - 240, ((yy - oy) / K - 58) / 0.4
            r = (gx * gx + gy * gy) ** 0.5
            if r >= 150:
                continue
            q = max(0, (r - 10) / 140)
            a = 0.55 + (0.32 - 0.55) * q / 0.6 if q < 0.6 else 0.32 * (1 - (q - 0.6) / 0.4)
            ep[xx, yy] = (8, 6, 10, int(255 * a))
    out = Image.alpha_composite(out, el)
    # dải tối dẹt sau câu giới thiệu: tâm (240, 93), bán kính 180 × 16,2 (scale 1 : 0,09), 0,5 → 0,38 @ 70% → 0
    el = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ep = el.load()
    for yy in range(max(0, oy + int(74 * K)), min(H, oy + int(112 * K))):
        for xx in range(max(0, ox + 55 * K), min(W, ox + 425 * K)):
            gx, gy = (xx - ox) / K - 240, ((yy - oy) / K - 93) / 0.09
            r = (gx * gx + gy * gy) ** 0.5
            if r >= 180:
                continue
            q = max(0, (r - 10) / 170)
            a = 0.5 + (0.38 - 0.5) * q / 0.7 if q < 0.7 else 0.38 * (1 - (q - 0.7) / 0.3)
            ep[xx, yy] = (8, 6, 10, int(255 * a))
    out = Image.alpha_composite(out, el)
    g = Image.new('RGBA', (480 * K, 270 * K), (0, 0, 0, 0))  # lớp giao diện trong khung
    d = ImageDraw.Draw(g)
    # mặt trống + logo
    tr_, _ = gd('gd-trong-dong')
    x, y, r = TL['trong']
    sz = (r * 2 + 2) * K
    t = tr_.resize((sz, sz), Image.LANCZOS)
    t.putalpha(t.getchannel('A').point(lambda v: int(v * 0.85)))
    g.alpha_composite(t, (int((x - r - 1) * K), int((y - r - 1) * K)))
    lo, _ = gd('gd-logo')
    L = TL['logo']
    g.alpha_composite(lo.resize((L[2] * K, L[3] * K), Image.LANCZOS), (L[0] * K, L[1] * K))
    dy = L[1] - 52
    sub = 'S P I R I T B L A D E'
    sw = rong(sub, 9, True)
    d.rectangle([((240 - sw / 2 - 26) * K, (98 + dy) * K), ((240 - sw / 2 - 8) * K, (99 + dy) * K)], fill=(168, 117, 47))
    d.rectangle([((240 + sw / 2 + 8) * K, (98 + dy) * K), ((240 + sw / 2 + 26) * K, (99 + dy) * K)], fill=(168, 117, 47))
    chu(d, sub, 240, 101.5 + dy, 9, True, (217, 164, 65))
    tag = tr('Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.', lg)
    size = 8
    while size > 6.5 and rong(tag, size) > 296:
        size -= 0.5
    w_tag = chu(d, tag, 240, 106 + dy + 7 + size * 0.36, size)
    if not bang:
        M, Gg, Bv = TL['main'], TL['gg'], TL['bv']
        for ma, o, s_, sz_, b in (('gd-nut-chinh', M, tr('Chơi ngay ▶', lg), 12, True), ('gd-nut-thuong', Gg, tr('Đăng nhập Google', lg), 8.5, True),
                                  ('gd-nut-thuong', Bv, tr('🏆 Bảng vàng', lg).replace('🏆 ', ''), 8, True)):
            g.alpha_composite(chin_manh(ma, o[2], o[3]), (o[0] * K, o[1] * K))
            lx = o[0] + o[2] / 2
            them = 0
            if ma == 'gd-nut-thuong' and o is Gg:  # chữ G Google bên trái
                d.ellipse([((o[0] + 15 - 6.5) * K, (o[1] + o[3] / 2 - 6.5) * K), ((o[0] + 15 + 6.5) * K, (o[1] + o[3] / 2 + 6.5) * K)], fill=(255, 246, 232))
                chu(d, 'G', o[0] + 15, o[1] + o[3] / 2 + 3, 8, True, (66, 133, 244), bong=False)
                lx = o[0] + 26 + (o[2] - 30) / 2; them = 24
            if o is Bv:  # cúp vàng (game vẽ biểu tượng riêng)
                wv = rong(s_, sz_, b)
                ix = lx - wv / 2 - 6
                d.rectangle([((ix - 3) * K, (o[1] + 8) * K), ((ix + 3) * K, (o[1] + 14) * K)], fill=(240, 184, 64))
                d.rectangle([((ix - 1) * K, (o[1] + 14) * K), ((ix + 1) * K, (o[1] + 17) * K)], fill=(240, 184, 64))
                lx += 5; them = 14
            w = chu(d, s_, lx, o[1] + o[3] / 2 + sz_ * 0.36 + (0 if ma == 'gd-nut-chinh' else 0), sz_, b, (255, 244, 220) if ma == 'gd-nut-chinh' else TXT)
            if bao is not None:
                bao.append((s_, w + them, o[2] - 12))
        info = tr('Đã có tài khoản? Bấm Đăng nhập Google để chơi tiếp tiến trình cũ. {0}', lg).replace('{0}', tr('Đã kết nối mây', lg))
        ls = wrap(info, 276, 7)
        szi = 7
        while len(ls) > 2 and szi > 6:
            szi -= 0.5; ls = wrap(info, 276, szi)
        bh = 18
        tong = szi + (len(ls) - 1) * (szi + 2)
        y0 = TL['info'] - 7 + (bh - tong) / 2 + szi * 0.8
        for i, l in enumerate(ls[:2]):
            chu(d, l, 240, y0 + i * (szi + 2), szi, False, (201, 191, 168))
        if bao is not None:
            bao.append(('thông tin (%d dòng, cỡ %.1f)' % (len(ls), szi), max(rong(l, szi) for l in ls), 280))
    lang = [TL['lang'][0] - 8, TL['lang'][1], TL['lang'][2] + 8, TL['lang'][3]]
    g.alpha_composite(chin_manh('gd-nut-thuong', lang[2], lang[3]), (lang[0] * K, lang[1] * K))
    chu(d, 'EN / VI', lang[0] + lang[2] / 2, lang[1] + lang[3] / 2 + 2.7, 7.5, True, GOLD if lg == 'en' else TXT)
    chu(d, tr('Phiên bản {0}', lg).replace('{0}', 'lk-2026.10.15-2130'), 474, 264, 7, False, (232, 222, 196), 'rs')
    if bao is not None:
        bao.append(('câu giới thiệu (cỡ %.1f)' % size, w_tag, 296))
    out.alpha_composite(g, (ox, oy))
    if bang:  # Bảng vàng mở trên màn chính: T.dim(0.45) phủ cả lề + khung bảng (gd-khung-bang) + nút Đóng
        out = Image.alpha_composite(out, Image.new('RGBA', (W, H), (6, 14, 14, int(255 * 0.45))))
        g2 = Image.new('RGBA', (480 * K, 270 * K), (0, 0, 0, 0))
        d2 = ImageDraw.Draw(g2)
        px, py, pw, ph = 80, 46 + 28, 320, 220 - 28
        g2.alpha_composite(chin_manh('gd-khung-bang', pw + 6, ph + 6), ((px - 3) * K, (py - 3) * K))
        chu(d2, tr('Bảng vàng', lg), px + 9, py + 13, 11, True, (255, 240, 190), 'ls')
        g2.alpha_composite(chin_manh('gd-nut-thuong', 60, 17), ((px + pw - 66) * K, (py + 3) * K))
        chu(d2, tr('✕ Đóng', lg), px + pw - 36, py + 14.5, 8, True, TXT)
        for i in range(6):
            chu(d2, '%d.  ………………………………   %d' % (i + 1, 9000 - i * 700), px + 20, py + 40 + i * 20, 8, False, TXT, 'ls')
        chu(d2, '(nội dung bảng do js/bang_vang.js vẽ — không đổi)', 240, py + ph - 12, 7, False, (201, 191, 168))
        out.alpha_composite(g2, (ox, oy))
    return out.convert('RGB')


def main():
    o_rong = 560  # bề rộng mỗi ô trong ảnh soát
    cells = []
    bao = []
    for bia in BIA:
        for lg in ('vi', 'en'):
            b = []
            a = man(bia, lg, 37, 0, bao=b)  # ngang 19,5:9: khung 16:9 + lề trái phải
            bao.append((bia, lg, b))
            cells.append(('%s · %s · ngang 19,5:9 (điện thoại)' % (bia, lg.upper()), a))
            cells.append(('%s · %s · 4:3 (máy tính bảng)' % (bia, lg.upper()), man(bia, lg, 0, 45)))
            cells.append(('%s · %s · dọc (game xoay 90°)' % (bia, lg.upper()), man(bia, lg, 37, 0).rotate(90, expand=True)))
            cells.append(('%s · %s · Bảng vàng mở trên màn chính' % (bia, lg.upper()), man(bia, lg, 37, 0, bang=True)))
    cot = 4
    th = []
    for nhan, im in cells:
        k = min(o_rong / im.width, 330 / im.height)
        th.append((nhan, im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)))
    oh = max(t.height for _, t in th)
    hang = (len(th) + cot - 1) // cot
    out = Image.new('RGB', (cot * (o_rong + 10) + 10, 50 + hang * (oh + 30)), (20, 18, 24))
    dr = ImageDraw.Draw(out)
    dr.text((10, 12), 'xem-bia.png — ảnh soát tĩnh màn hình chính trên bìa mới (không chạy game). Bố cục TL_BIA (js/village.js), lớp tối js/bia.js, ảnh giao diện thật. Phông đo: DejaVu Sans.',
            font=ImageFont.truetype(FONT, 15), fill=(246, 220, 146))
    for i, (nhan, t) in enumerate(th):
        x, y = 10 + (i % cot) * (o_rong + 10), 44 + (i // cot) * (oh + 30)
        out.paste(t, (x + (o_rong - t.width) // 2, y))
        dr.text((x, y + oh + 4), nhan, font=ImageFont.truetype(FONT, 13), fill=(200, 200, 190))
    p = os.path.join(HERE, 'xem-bia.png')
    out.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(p, optimize=True)
    print('Đã ghi', os.path.relpath(p, ROOT), out.size, '%d KB' % (os.path.getsize(p) // 1024))
    for bia, lg, b in bao:
        for s, w, cho in b:
            print('%-16s %s  %-40s %5.1f / %5.1f%s' % (bia, lg.upper(), s[:40], w, cho, '  ← TRÀN' if w > cho else ''))


if __name__ == '__main__':
    main()
