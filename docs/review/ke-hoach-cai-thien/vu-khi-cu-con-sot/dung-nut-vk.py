#!/usr/bin/env python3
"""Dựng 6 ảnh nút Đánh / Đặc biệt cho Kiếm, Thương, Búa (14/10, YEU-CAU.md mục 3) cùng phong cách 2 nút -bow mới:
48×48 điểm ảnh (net 2 → 24 điểm game), nền trong suốt, vũ khí ô zed-vk cấp Trắng đặt chéo ở giữa, viền tối 1 điểm.
Nút Đặc biệt: vũ khí nhỏ hơn + nét hiệu ứng của chiêu lấy từ ảnh hiệu ứng đã có
  kiếm  (Trảm Nguyệt): vệt chém cong   — hu-chem-kiem khung 2
  thương (Phi Thương): vệt phóng thẳng — hu-dam-giao khung 2
  búa   (Địa Chấn):    sóng đất / đá   — hu-nen-dat khung 2
Ghi đè game/art/custom/gd-nut-{danh,dac-biet}-{sword,spear,hammer}.sprite.json và ảnh soát tĩnh xem-nut-vk.png (6 nút mới cạnh 2 nút -bow).
Chỉ xử lý ảnh (Pillow), không chạy game.   python3 docs/review/ke-hoach-cai-thien/vu-khi-cu-con-sot/dung-nut-vk.py
"""
import base64, io, json, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
CUS = os.path.join(ROOT, 'game', 'art', 'custom')
N = 48
VIEN = (26, 20, 32, 255)


def doc(ma):
    with open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8') as f:
        t = json.load(f)
    s = t.get('tam') or t.get('anh')
    return t, Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def khung(ma, i):
    t, im = doc(ma)
    w, h = t['khung_rong'] * t['net'], t['khung_cao'] * t['net']
    cot = im.width // w
    return im.crop(((i % cot) * w, (i // cot) * h, (i % cot) * w + w, (i // cot) * h + h))


def sat(im):
    b = im.getbbox()
    return im.crop(b) if b else im


def thu(im, w, h):
    """Thu ảnh vừa khung w×h (giữ tỉ lệ), lọc mịn rồi chốt alpha đặc/trong cho mép sắc như pixel."""
    k = min(w / im.width, h / im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 110 else (0, 0, 0, 0)
    return im


def vien(im):
    """Thêm viền tối 1 điểm quanh phần đặc (như hình nút -bow)."""
    o = Image.new('RGBA', im.size, (0, 0, 0, 0))
    a = im.split()[3].load()
    po = o.load()
    for y in range(im.height):
        for x in range(im.width):
            if a[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < im.width and 0 <= Y < im.height and a[X, Y]:
                    po[x, y] = VIEN
                    break
    o.alpha_composite(im)
    return o


def vk(loai, co):
    t, im = doc('zed-vk')
    r = t['vk'][loai][0]  # cấp Trắng
    o = im.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    o = sat(o.rotate(45, resample=Image.BICUBIC, expand=True))  # mũi chĩa lên phải như nút -bow
    return thu(o, co, co)


def dat(nen, im, cx, cy):
    nen.alpha_composite(im, (round(cx - im.width / 2), round(cy - im.height / 2)))


def nut_danh(loai):
    c = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    dat(c, vk(loai, 42), N / 2, N / 2)
    return vien(c)


def nut_dac_biet(loai):
    c = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    if loai == 'kiem':
        fx = thu(sat(khung('hu-chem-kiem', 2)), 30, 34)
        dat(c, fx, 33, 17)
        dat(c, vk(loai, 32), 18, 30)
    elif loai == 'thuong':
        fx = sat(khung('hu-dam-giao', 2).rotate(45, resample=Image.BICUBIC, expand=True))
        fx = thu(fx, 30, 30)
        dat(c, vk(loai, 36), 20, 28)
        dat(c, fx, 31, 17)
    else:
        fx = thu(sat(khung('hu-nen-dat', 2)), 46, 22)
        dat(c, fx, N / 2, 36)
        dat(c, vk(loai, 34), 22, 20)
    return vien(c)


def ghi(ma, ten, im):
    b = io.BytesIO()
    im.save(b, 'PNG', optimize=True)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': 24, 'cao': 24, 'net': 2,
         'anh': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    with open(os.path.join(CUS, ma + '.sprite.json'), 'w', encoding='utf-8') as f:
        json.dump(t, f, ensure_ascii=False)


def main():
    LOAI = [('sword', 'kiem', 'Kiếm', 'Trảm Nguyệt'), ('spear', 'thuong', 'Thương', 'Phi Thương'), ('hammer', 'bua', 'Búa', 'Địa Chấn')]
    for en, vi, ten, chieu in LOAI:
        ghi('gd-nut-danh-' + en, 'Đánh · ' + ten, nut_danh(vi))
        ghi('gd-nut-dac-biet-' + en, 'Đặc biệt · ' + chieu, nut_dac_biet(vi))
    # ảnh soát tĩnh: hàng trên Đánh, hàng dưới Đặc biệt; cột: kiếm, thương, búa, phi tiêu (-bow, có sẵn). Mỗi nút phóng 3 lần,
    # đặt trên đĩa tròn màu mặt nút để thấy như trong game; dưới cùng là cỡ thật 24 điểm game.
    cols = ['sword', 'spear', 'hammer', 'bow']
    S, P = 144, 12
    W, H = len(cols) * (S + P) + P, 2 * (S + P) + P + 70
    o = Image.new('RGBA', (W, H), (34, 40, 48, 255))
    d = ImageDraw.Draw(o)
    for j, k in enumerate(['danh', 'dac-biet']):
        for i, ty in enumerate(cols):
            _, im = doc('gd-nut-%s-%s' % (k, ty))
            x, y = P + i * (S + P), P + j * (S + P)
            d.ellipse((x, y, x + S, y + S), fill=(58, 46, 40, 255) if k == 'danh' else (34, 74, 70, 255), outline=(168, 117, 47, 255), width=4)
            o.alpha_composite(im.resize((S, S), Image.NEAREST), (x, y))
            o.alpha_composite(im.resize((24, 24), Image.LANCZOS), (P + i * (S + P) + j * 30, 2 * (S + P) + P + 10))
    o.save(os.path.join(HERE, 'xem-nut-vk.png'))
    print('xong: 6 nút + xem-nut-vk.png')


if __name__ == '__main__':
    main()
