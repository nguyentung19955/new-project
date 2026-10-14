#!/usr/bin/env python3
"""Ảnh soát tĩnh xem-lang-moi.png (14/10, YEU-CAU.md mục 7): ghép từ ẢNH (không chạy game) những gì còn lại trong làng sau khi bỏ hình
vẽ code kiểu cũ: nền gd-lang-nen, công trình / đạo cụ / con vật gd-lang-*, 7 người làng nl-* (khung đứng đầu), 3 bạn em-be-* ngồi ở sân
đình (hàng ngồi), Zed (zed-moi khung đứng + kiếm zed-vk cấp Trắng). Không còn: 2 vũ khí bay cạnh nhân vật, sậy và áo phơi vẽ code.
Vị trí lấy theo toạ độ trong js/village_scene.js (B, NPCS.pos); đặt GIỮA ĐÁY ảnh vào chân vật nên có thể lệch vài điểm ảnh so với game
(game đặt theo khung bao của hình code cũ). Tỉ lệ 2 điểm ảnh / điểm game (đúng độ nét ảnh).
   python3 docs/review/ke-hoach-cai-thien/vu-khi-cu-con-sot/dung-xem-lang.py
"""
import base64, io, json, math, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
CUS = os.path.join(ROOT, 'game', 'art', 'custom')
K = 2  # điểm ảnh / điểm game


def doc(ma):
    with open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8') as f:
        t = json.load(f)
    s = t.get('tam') or t.get('anh')
    return t, Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def nhan(im, col=(0xb6, 0xb0, 0xdc)):
    """Nhân màu chạng vạng như game (tint NIGHT)."""
    r, g, b, a = im.split()
    r = r.point(lambda v: v * col[0] // 255); g = g.point(lambda v: v * col[1] // 255); b = b.point(lambda v: v * col[2] // 255)
    return Image.merge('RGBA', (r, g, b, a))


def main():
    B = {'cong': (64, 60), 'dinh': (196, 116), 'da': (338, 128), 'gieng': (296, 196), 'ren': (462, 112), 'xen': (552, 196), 'may': (594, 108),
         'phoi': (520 + 19, 104), 'thuyen': (694 + 14, 178), 'tranh': (618, 196), 'rom': (404, 240)}
    _, nen = doc('gd-lang-nen')
    o = nhan(nen.resize((720 * K, 270 * K), Image.NEAREST))
    lop = []  # (y chân, hàm vẽ)

    def vat(ma, x, y, toi=True):
        t, im = doc(ma)
        im = nhan(im) if toi else im
        lop.append((y, lambda: o.alpha_composite(im, (round((x - t['rong'] / 2) * K), round((y - t['cao']) * K)))))

    for ten, k in [('cong', 'cong'), ('dinh', 'dinh'), ('cay-da', 'da'), ('lo-ren', 'ren'), ('hang-xen', 'xen'), ('nha-may', 'may'),
                   ('gieng', 'gieng'), ('day-phoi', 'phoi'), ('bang-tranh', 'tranh'), ('cay-rom', 'rom'), ('do', 'thuyen')]:
        vat('gd-lang-' + ten, B[k][0], B[k][1])
    vat('gd-lang-de', 468 + 20, 133)
    vat('gd-lang-chum', 404 + 22, 242); vat('gd-lang-chum', 404 + 32, 238)
    for q in [(262, 152), (420, 180), (130, 190)]:
        vat('gd-lang-cot-den', q[0], q[1])
    for dx, dy, ma in [(-34, -18, 'gd-lang-ga'), (-22, -8, 'gd-lang-ga-mo'), (-44, -4, 'gd-lang-ga')]:
        vat(ma, 404 + dx, 240 + dy, False)
    vat('gd-lang-coc', 296 - 9, 186, False)
    # người làng: khung đầu hàng đứng; goc = chân trong khung
    NL = {'lai': (638, 152), 'ren': (468, 132), 'xen': (548, 214), 'may': (574, 132), 'do': (352, 176), 'tu': (234, 120), 'mo': (100, 100)}
    import re
    src = open(os.path.join(ROOT, 'game', 'js', 'village_scene.js'), encoding='utf-8').read()
    for k in NL:  # đọc đúng pos trong mã nếu có
        m = re.search(r"\n    %s: \{[^\n]*?pos: \[(\d+), (\d+)\]" % k, src)
        if m:
            NL[k] = (int(m.group(1)), int(m.group(2)))

    def khung(ma, hang, i, x, y):
        t, im = doc(ma)
        w, h, n = t['khung_rong'] * t['net'], t['khung_cao'] * t['net'], t['net']
        f = im.crop((i * w, hang * h, i * w + w, hang * h + h))
        lop.append((y, lambda: o.alpha_composite(f, (round(x * K - t['goc'][0] * n), round(y * K - t['goc'][1] * n)))))

    for k, q in NL.items():
        khung('nl-' + k, 0, 0, q[0], q[1])
    for i, k in enumerate(['hunter', 'healer', 'wrestler']):
        q = [(186, 134), (206, 142), (226, 134)][i]
        khung('em-be-' + k, 1, 0, q[0], q[1])
    # Zed đứng giữa đường làng, cầm kiếm zed-vk cấp Trắng (neo khung 0 của hàng dung_kiem)
    zt, zim = doc('zed-moi')
    vt, vim = doc('zed-vk')
    da = zt['dong_tac']['dung_kiem']
    zx, zy = 300, 168

    def zed():
        S = zt['khung_rong'] * zt['net']
        f = zim.crop((0, da['hang'] * S, S, da['hang'] * S + S))
        ox, oy = round(zx * K - zt['goc'][0] * 2), round(zy * K - zt['goc'][1] * 2)
        o.alpha_composite(f, (ox, oy))
        n = da['neo'][0]
        r = vt['vk']['kiem'][0]
        cell = vim.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
        F = da['vk_tl'] * 2
        cell = cell.resize((max(1, round(r[2] * F)), max(1, round(r[3] * F))), Image.LANCZOS)
        g = da['vk_cam'][0]
        # quay quanh điểm cầm (g) góc n[2] độ (dương chúc xuống)
        big = Image.new('RGBA', (cell.width * 3, cell.width * 3), (0, 0, 0, 0))
        cx, cy = big.width // 2, big.height // 2
        big.alpha_composite(cell, (round(cx - g[0] * F), round(cy - g[1] * F)))
        big = big.rotate(-n[2], resample=Image.BICUBIC, center=(cx, cy))
        o.alpha_composite(big, (round(ox + n[0] - cx), round(oy + n[1] - cy)))
        if da.get('hang_tay') is not None:
            tay = zim.crop((0, da['hang_tay'] * S, S, da['hang_tay'] * S + S))
            o.alpha_composite(tay, (ox, oy))
    lop.append((zy, zed))
    for _, fn in sorted(lop, key=lambda q: q[0]):
        fn()
    out = Image.new('RGBA', (o.width, o.height + 34), (24, 28, 34, 255))
    out.alpha_composite(o, (0, 34))
    ImageDraw.Draw(out).text((8, 8), 'Lang moi (ghep tu anh gd-lang-*, nl-*, em-be-*, zed-moi + zed-vk; khong chay game). Da bo: 2 vu khi bay, say, ao phoi, nha/nguoi ve code.', fill=(240, 230, 200, 255))
    out.save(os.path.join(HERE, 'xem-lang-moi.png'))
    print('xong: xem-lang-moi.png', out.size)


if __name__ == '__main__':
    main()
