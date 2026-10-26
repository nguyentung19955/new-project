"""Bước 4 – ảnh xem thử: cảnh ghép 960×540 logic (xuất 2x 1920×1080 và 1x 960×540, thu nhỏ LANCZOS – không phóng nearest),
đoạn nền gạch mẫu, thử cuộn parallax (lặp lật), bảng ô/vật có tên.
Lam: lấy ảnh nhìn ngang của rig-v2 (code/nguon/lam-nhin-ngang.png = bản chép art/modular/lam-moi/rig-v2/nguon/2-nhin-ngang.png),
tách nền, đặt cao 112 px logic (224 px ở 2x), chân chạm mặt gạch."""
import json
import os

import numpy as np
from PIL import Image, ImageDraw

from chung import (BOI, DOVAT, GACH, LAM_CAO, NEN, NGUON, T2, XEM, dan, doc_rgb, doi_co, font, luu_png, tach_vung, u8)
from dung_nen import Gach, chon_o, ve_luoi

W2, H2 = 1920, 1080


def lam_dung():
    a = doc_rgb('lam-nhin-ngang.png')
    rg, _ = tach_vung(a, (0, 0, a.shape[1], a.shape[0]), pad=0)
    al = rg[..., 3] > 0
    ys, xs = np.nonzero(al)
    rg = rg[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = LAM_CAO * BOI / rg.shape[0]
    im = doi_co(rg, round(rg.shape[1] * s), LAM_CAO * BOI)
    # neo: giữa hai ủng ở đáy
    day = im[-12:, :, 3] > 128
    xs = np.nonzero(day.any(0))[0]
    return im, ((xs.min() + xs.max()) / 2, im.shape[0])


class DoVat:
    def __init__(self):
        self.meta = json.load(open(os.path.join(DOVAT, 'do-vat-atlas.json'), encoding='utf-8'))
        self.at = np.array(Image.open(os.path.join(DOVAT, self.meta['anh'])).convert('RGBA'))

    def ve(self, out, ten, X, Y):
        """(X,Y) = điểm đáy-giữa, px 2x."""
        v = self.meta['vat'][ten]
        x, y, w, h = v['khung']
        nx, ny = v['neo']
        return dan(out, self.at[y:y + h, x:x + w], X - nx, Y - ny)


def nap(ten):
    p = os.path.join(NEN, ten + '.png')
    return np.array(Image.open(p).convert('RGBA')).astype(np.float64)


def lop_lap(out, im, p, a=1.0, lat=True):
    """Vẽ lớp nền rộng W2 lặp (lat=True: bản LẬT xen kẽ như veLap trong demo.html; False: lặp thẳng), dịch trái p px."""
    i = int(np.floor(p / W2))
    for n in range(2):
        x = (i + n) * W2 - p
        src = im[:, ::-1] if (lat and (i + n) % 2) else im
        if a < 1:
            src = src.copy(); src[..., 3] *= a
        out = dan(out, src, x, 0)
    return out


# lưới cảnh 30 cột × 17 hàng (sàn ở hàng 14 như demo.html, FLOOR = 14*32)
CANH = [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............=====...........',
    '...................SS.........',
    '.........////...\\..SS.........',
    '###############...############',
    '###############...############',
    '###############...############',
]


def lam_luoi():
    # dốc: '/' ở cột 9, khối đồi cột 10–12, '\' ở cột 13 (sửa lại cho đúng ý: đồi nhỏ trên sàn)
    G = [list(r) for r in CANH]
    G[13] = list('.........' + '/###\\' + '.....' + 'SS' + '.........')
    return [''.join(r) for r in G]


def canh(diu=False, cam=0.0):
    out = np.zeros((H2, W2, 4))
    s = '-diu' if diu else ''
    xa, mt, giua, cay, la = (nap(k + s) for k in ('xa', 'mat-troi', 'giua', 'gan-cay', 'gan-la'))
    out = lop_lap(out, xa, cam * 0.2)
    out = dan(out, mt, -cam * 0.2, 0)
    out = lop_lap(out, giua, cam * 0.45, lat=False)
    G = lam_luoi()
    G2 = [r + r for r in G]                  # 2 bản lưới nối nhau để thử cuộn
    dx = -(cam % (30 * T2))
    g = Gach()
    out, _ = ve_luoi(G2, g, ox=dx, rong=W2, cao=H2, nen=out)
    dv = DoVat()
    F = 14 * T2                     # mặt sàn (px 2x)
    lam, (nx, ny) = lam_dung()
    for k in range(2):
        b = dx + k * 30 * T2
        if b > W2 or b + 30 * T2 < 0:
            continue
        out = dv.ve(out, 'bien-chi-duong', b + 1.6 * T2, F)
        out = dv.ve(out, 'cong-tac-len', b + 3.6 * T2, F)
        out = dv.ve(out, 'diem-luu-sang', b + 11.5 * T2, 13 * T2)
        out = dv.ve(out, 'manh-chuong', b + 16.5 * T2, 10.2 * T2)
        out = dv.ve(out, 'thung-go', b + 20 * T2, 12 * T2)
        out = dv.ve(out, 'binh-mau', b + 22.5 * T2, F)
        out = dv.ve(out, 'cong-dong', b + 26.5 * T2, F)
        if k == 0 or cam:
            out = dan(out, lam, b + 6.6 * T2 - nx, F + 4 - ny)        # chân lún 2 px logic vào rêu (như demo)
    out = lop_lap(out, cay, cam * 1.15)
    out = lop_lap(out, la, cam * 1.15, a=0.5)
    return out


def ghi_chu(im, chu):
    d = ImageDraw.Draw(im)
    f = font(18)
    d.rectangle([0, 0, im.width, 26], fill=(0, 0, 0, 160))
    d.text((8, 4), chu, fill=(255, 255, 255), font=f)
    return im


def bang(atlas_meta, at, ten_khoa, co_o=None, nen=(96, 112, 138)):
    items = list(atlas_meta[ten_khoa].items())
    cot = 8
    cw, ch = 220, 190 if co_o else 300
    if not co_o:
        cot = 5
        cw, ch = 360, 330
    hang = (len(items) + cot - 1) // cot
    im = Image.new('RGBA', (cot * cw, hang * ch), nen + (255,))
    d = ImageDraw.Draw(im)
    f = font(14)
    for i, (ten, v) in enumerate(items):
        x, y, w, h = v['khung']
        sub = Image.fromarray(at[y:y + h, x:x + w])
        cx, cy = (i % cot) * cw, (i // cot) * ch
        if co_o:
            ox, oy = v['ve_lech']
            bx, by = cx + (cw - T2) // 2, cy + 50
            d.rectangle([bx, by, bx + T2 - 1, by + T2 - 1], outline=(255, 80, 80))   # khung ô 32 logic
            im.alpha_composite(sub, (bx + ox, by + oy))
        else:
            nx, ny = v['neo']
            bx, by = cx + cw // 2, cy + ch - 40
            im.alpha_composite(sub, (int(bx - nx), int(by - ny)))
            d.line([bx - 6, by, bx + 6, by], fill=(255, 60, 60), width=2)
            d.line([bx, by - 6, bx, by + 6], fill=(255, 60, 60), width=2)
        d.text((cx + 6, cy + ch - 22), ten, fill=(255, 255, 255), font=f)
    return im


def doan_nen_mau():
    """Đoạn nền mẫu: mặt đất dài, bậc, hố, ván một chiều, dốc, cột đá, trần, gờ nổi – trên nền phẳng để soi đường ghép."""
    G = [
        '..............................................',
        '...SSSSSSS................................###.',
        '...SSSSSSS.....=====..........................',
        '.....S..............................##........',
        '.....S..........................####..........',
        '.........................=======..............',
        '..............###.......................###...',
        '.............#####......................###...',
        '###########/#######\\######.....#####.....###..',
        '############################.....############.',
        '##############################...#############',
        '##############################...#############',
    ]
    w = max(len(r) for r in G)
    G = [r.ljust(w, '.') for r in G]
    nen = np.zeros((len(G) * T2, w * T2, 4))
    nen[..., :3] = (150, 170, 200)
    nen[..., 3] = 255
    out, ds = ve_luoi(G, nen=nen)
    return out, G, ds


def chay():
    os.makedirs(XEM, exist_ok=True)
    for diu in (False, True):
        o = canh(diu)
        ten = 'canh-ghep' + ('-diu' if diu else '')
        im2 = Image.fromarray(u8(o)).convert('RGB')
        im2.save(f'{XEM}/{ten}-2x.png', optimize=True)
        im1 = im2.resize((960, 540), Image.LANCZOS)
        im1.save(f'{XEM}/{ten}-1x.png', optimize=True)
    # thử cuộn: 3 vị trí camera, 1x, xếp dọc
    ks = []
    for cam in (0, 1500, 3100):
        im = Image.fromarray(u8(canh(True, cam))).convert('RGB').resize((960, 540), Image.LANCZOS)
        ks.append(ghi_chu(im, f'camera x = {cam // 2} px logic  xa ×0,2 lật · giữa ×0,45 thẳng · gạch ×1 · gần ×1,15 lật'))
    cu = Image.new('RGB', (960, 540 * 3 + 8))
    for i, im in enumerate(ks):
        cu.paste(im, (0, i * 544))
    cu.save(f'{XEM}/cuon-thu-1x.png', optimize=True)
    # đoạn nền mẫu
    o, G, ds = doan_nen_mau()
    im = Image.fromarray(u8(o)).convert('RGB')
    im.save(f'{XEM}/doan-nen-mau-2x.png', optimize=True)
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(f'{XEM}/doan-nen-mau-1x.png', optimize=True)
    # cùng đoạn, vẽ lưới ô + tên ô để soi
    d = ImageDraw.Draw(im)
    f = font(11)
    for y, x, t in ds:
        d.rectangle([x * T2, y * T2, x * T2 + T2 - 1, y * T2 + T2 - 1], outline=(255, 255, 255))
        d.text((x * T2 + 2, y * T2 + 2), t.replace('dat-', '').replace('da-', 'đá ')[:9], fill=(255, 255, 0), font=f)
    im.save(f'{XEM}/doan-nen-mau-luoi-2x.png', optimize=True)
    # bảng có tên
    gm = json.load(open(os.path.join(GACH, 'gach-atlas.json'), encoding='utf-8'))
    ga = np.array(Image.open(os.path.join(GACH, 'gach-atlas.png')).convert('RGBA'))
    bang(gm, ga, 'o', co_o=True).convert('RGB').save(f'{XEM}/bang-o-gach.png', optimize=True)
    dm = json.load(open(os.path.join(DOVAT, 'do-vat-atlas.json'), encoding='utf-8'))
    da = np.array(Image.open(os.path.join(DOVAT, 'do-vat-atlas.png')).convert('RGBA'))
    bang(dm, da, 'vat').convert('RGB').save(f'{XEM}/bang-do-vat.png', optimize=True)
    # so cỡ: Lam cạnh từng vật + ô gạch, đúng tỉ lệ 2x
    lam, (nx, ny) = lam_dung()
    luu_png(lam, f'{XEM}/lam-dung-112px-2x.png')
    print('xem thử: xong →', XEM)


if __name__ == '__main__':
    chay()
