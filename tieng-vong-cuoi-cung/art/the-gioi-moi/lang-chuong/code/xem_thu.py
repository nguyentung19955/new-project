"""Bước 5 – cảnh ghép thử 960×540 logic: nền 3 lớp (+ tiền cảnh) + gạch lát nền/bậc/dốc/ván + cổng + đồ nhỏ + Lam + quái.
Xuất 3 bản duyệt (KHÔNG có bản phóng ×4 nearest):
  xem-thu/canh-ghep-2x-v2.png    ảnh lớn 1920×1080 (đúng độ phân giải asset)
  xem-thu/canh-ghep-960-v2.png   đúng 960×540
  xem-thu/canh-ghep-xam-v2.png   960×540 chuyển xám – kiểm nền / sàn / Lam / quái có tách nhau không
và thêm bảng ô gạch có tên: xem-thu/bang-o-gach-v2.png. (Bản không -v2 là bản trước khi có thân gỗ gen / rễ / tiền cảnh mới.)"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw

from chung import DOVAT, GACH, NEN, REPO_ART, XEM, dan, font, luu_png, u8

W, H = 1920, 1080      # 2x
O = 64                 # ô 2x
CAM_X = 1043           # vị trí camera (px logic) để tính lệch parallax (chọn để cụm tiền cảnh nằm ở mép phải)


def doc(p):
    return np.asarray(Image.open(p).convert('RGBA')).astype(np.float64)


def lop_lap(nen, ten, he):
    im = doc(f'{NEN}/{ten}')
    w = im.shape[1]
    lech = int(round(CAM_X * 2 * he)) % w           # lớp trôi sang trái khi camera sang phải
    x = -lech
    while x < W:
        nen = dan(nen, im, x, 0)
        x += w
    return nen


def o(ten):
    return doc(f'{GACH}/o/{ten}.png')


# bản đồ ô: (cột, hàng, tên ô)
def than_go(c, r):
    """Chọn biến thể thân gỗ theo vị trí (như game: băm (cột, hàng) cố định) – 8 ô từ ảnh gen."""
    h = ((c * 374761393 + r * 668265263) & 0xffffffff) % 1000 / 1000
    i = int(h * 8)
    return 'go-than' if i == 0 else f'go-than-{i + 1}'


def ban_do():
    m = []
    for c in range(0, 10):                              # sàn gỗ thấp (mặt ở hàng 14 = y 448 logic)
        m.append((c, 14, 'go-tren-giua' if c not in (3, 7) else ('go-tren-giua-2' if c == 3 else 'go-tren-giua-4')))
        m.append((c, 15, than_go(c, 15)))
        m.append((c, 16, than_go(c, 16)))
    m += [(10, 13, 'go-doc-thoai-len-1'), (11, 13, 'go-doc-thoai-len-2')]   # dốc thoải lên 1 ô
    for c in (10, 11):
        m += [(c, 14, than_go(c, 14)), (c, 15, than_go(c, 15)), (c, 16, than_go(c, 16))]
    for c in range(12, 18):                             # bậc gỗ cao (mặt hàng 13)
        m.append((c, 13, 'go-tren-giua' if c != 15 else 'go-tren-giua-3'))
        m += [(c, 14, than_go(c, 14)), (c, 15, than_go(c, 15)), (c, 16, than_go(c, 16))]
    # bệ đá xây (mặt hàng 12)
    m += [(18, 12, 'da-tren-trai'), (23, 12, 'da-tren-phai')]
    for c in range(19, 23):
        m.append((c, 12, 'da-tren-giua' if c != 21 else 'da-tren-giua-2'))
    for r in range(13, 17):
        m += [(18, r, 'da-canh-trai'), (23, r, 'da-canh-phai')]
        for c in range(19, 23):
            m.append((c, r, 'da-than' if (c + r) % 3 else ('da-than-2' if r % 2 else 'da-than-3')))
    for c in range(24, 31):                             # sàn gỗ phải (mặt hàng 14)
        m.append((c, 14, 'go-tren-giua'))
        m += [(c, 15, than_go(c, 15)), (c, 16, than_go(c, 16))]
    # ván một chiều
    m += [(5, 10, 'go-van-trai'), (6, 10, 'go-van-giua'), (7, 10, 'go-van-giua'), (8, 10, 'go-van-phai')]
    # cột gỗ treo + khối rời
    m += [(13, 7, 'go-cot-tren'), (13, 8, 'go-cot-than'), (13, 9, 'go-cot-day'), (23, 8, 'da-khoi')]
    return m


def sprite_khung(json_p, i=0):
    j = json.load(open(json_p, encoding='utf-8'))
    tr = j['trang'][0] if 'trang' in j else {'anh': j['anh'], 'cot': j['luoi']['cot']}
    sheet = doc(os.path.join(os.path.dirname(json_p), tr['anh']))
    fw, fh = j['co_khung']
    k = j['luoi']['khe_px']
    cot = tr['cot']
    x, y = (i % cot) * (fw + k), (i // cot) * (fh + k)
    return sheet[y:y + fh, x:x + fw], (j['diem_neo']['x'], j['diem_neo']['y'])


def canh():
    img = np.zeros((H, W, 4))
    img[..., 3] = 255
    img = lop_lap(img, 'lang-xa.png', 0.08)
    img = lop_lap(img, 'lang-giua.png', 0.40)
    img = lop_lap(img, 'lang-gan.png', 0.65)
    for c, r, ten in ban_do():
        img = dan(img, o(ten), c * O, r * O)
    # mảng rễ trang trí (4×4 ô) trên thân gỗ: bắt đầu ngay dưới hàng mặt rêu, phần dưới ra ngoài màn (như trong game)
    re = doc(f'{GACH}/rong-re.png')
    img = dan(img, re, 1 * O, 15 * O)
    img = dan(img, re[:, ::-1], 25 * O + O // 2, 15 * O)
    # cổng trên sàn phải: neo giữa đáy ở x = 860 logic, mặt sàn y = 448
    cg = doc(f'{DOVAT}/cong-dong.png')
    img = dan(img, cg, 860 * 2 - cg.shape[1] // 2, 448 * 2 - cg.shape[0])
    # đồ nhỏ
    for ten, x, y in (('cong-tac-len', 470, 416), ('cong-tac-an', 530, 416), ('binh-mau', 110, 448),
                      ('manh-chuong', 208, 300)):
        d = doc(f'{DOVAT}/{ten}.png')
        img = dan(img, d, x * 2 - d.shape[1] // 2, y * 2 - d.shape[0])
    # quái chuông gỗ trên bệ đá (mặt y = 384 logic), quay trái
    q, (qx, qy) = sprite_khung(f'{REPO_ART}/the-gioi-moi/quai-boss/sprite/quai-dung-2x.json')
    img = dan(img, q, 660 * 2 - qx, 384 * 2 - qy)
    # Lam (rig-v3, khung chạy 0) trên sàn gỗ thấp
    lam, (lx, ly) = sprite_khung(f'{REPO_ART}/modular/lam-moi/rig-v3/sprite/lam-chay-2x.json')
    img = dan(img, lam, 250 * 2 - lx, 448 * 2 - ly)
    img = lop_lap(img, 'lang-tien-canh.png', 1.05)
    return u8(img[..., :3])


def bang_o():
    files = sorted(f for f in os.listdir(f'{GACH}/o') if f.endswith('.png'))
    cot = 8
    cw, chh = 150, 112
    rows = (len(files) + cot - 1) // cot
    im = Image.new('RGB', (cot * cw + 20, rows * chh + 20), (96, 118, 140))
    d = ImageDraw.Draw(im)
    f = font(12)
    for i, fn in enumerate(files):
        x, y = 10 + (i % cot) * cw, 10 + (i // cot) * chh
        t = Image.open(f'{GACH}/o/{fn}').convert('RGBA')
        d.rectangle([x + 42, y + 2, x + 42 + 65, y + 2 + 65], outline=(70, 88, 106))
        im.paste(t, (x + 43, y + 3), t)
        d.text((x + 75, y + 74), fn[:-4], fill=(255, 255, 255), font=f, anchor='mt')
    return np.asarray(im)


def chay():
    os.makedirs(XEM, exist_ok=True)
    c2 = canh()
    luu_png(c2, f'{XEM}/canh-ghep-2x-v2.png')
    c1 = np.asarray(Image.fromarray(c2).resize((960, 540), Image.LANCZOS))
    luu_png(c1, f'{XEM}/canh-ghep-960-v2.png')
    xam = np.asarray(Image.fromarray(c1).convert('L').convert('RGB'))
    luu_png(xam, f'{XEM}/canh-ghep-xam-v2.png')
    luu_png(bang_o(), f'{XEM}/bang-o-gach-v2.png')
    print('xem thử: canh-ghep-2x / 960 / xam + bang-o-gach (-v2)')


if __name__ == '__main__':
    chay()
