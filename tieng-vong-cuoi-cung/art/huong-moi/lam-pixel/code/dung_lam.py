"""Dựng Lam PIXEL (≈36 điểm ảnh cao, nhìn ngang quay phải) hoàn toàn bằng code theo lưới + palette.json.

Nhận dạng lấy từ art/huong-moi/lam-chibi/mau-pixel-lam-tu-bang.png + gen-dung-1.png:
mũ trùm xanh trầm chóp ngả ra sau, mặt đen, MỘT mắt hổ phách, khăn kem, chuông đồng ở cổ, nĩa hai nhánh (Âm Đao).

Nguyên tắc (PH17 + PH18):
- ĐẦU/MŨ là MỘT bản vẽ ASCII cố định (DAU) – mọi khung dán y nguyên điểm ảnh, chỉ dịch nguyên điểm (nhún 0–1).
- Thân/áo, ủng, khăn, tay + nĩa dựng theo tham số từng khung (nghiêng 1 điểm, gấu + ủng luân phiên).
- Chém: lấy đà 2 hình → 1 hình đánh mạnh + cung chém 3 màu đặt ĐÚNG hộp chém 1 ([4,-97,86,48] px logic so với chân)
  → hồi 2 hình.

Chạy:  python3 art/huong-moi/lam-pixel/code/dung_lam.py
Ra:    art/huong-moi/lam-pixel/sprite/lam-pixel.png (1 điểm = 1 px) + lam-pixel.json, ảnh kiểm ×8 trong kiem/.
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixel import Anh, k, GOC

OW, OH = 48, 44          # ô khung (điểm ảnh)
AX, AY = 18, 42          # neo: giữa collider (x) – mặt đất (y, hàng ngay dưới đế ủng)
LOGIC = 3                # 1 điểm ảnh = 3 px logic

# ---------------------------------------------------------------- ĐẦU / MŨ (khoá điểm ảnh)
# chóp mũ ngả ra sau-trái, miệng mũ bên phải viền sáng, mặt đen, mắt hổ phách 2×3
DAU = [
    "kk..................",
    "k21kk...............",
    ".k322kkk............",
    "...k3222kkk.........",
    "...k332222kkk.......",
    "....k3322222211k....",
    "....k33222222221k...",
    "...k333222222222k...",
    "...k3322222kkkk21k..",
    "..k33322222kfffk21k.",
    "..k3332222kffffk121k",
    "..k333222kffffEek21k",
    "..k433222kffffeek21k",
    "..k433322kfffffok22k",
    "..k443332kffffffk2k.",
    "...k44333kfffffk22k.",
    "...k444333kkkkk222k.",
    "....kk44443333222k..",
    "......kkkkkkkkkkk...",
]
DAU_W = len(DAU[0])
# vị trí dán đầu khi đứng thẳng (góc trên-trái trong ô)
DAU_X, DAU_Y = AX - 9, AY - 36
# toạ độ mắt trong DAU (điểm 'E')
MAT_DX, MAT_DY = 14, 11


def ve_dau(a, dx=0, dy=0):
    a.ascii(DAU, DAU_X + dx, DAU_Y + dy)


# ---------------------------------------------------------------- THÂN / ÁO
def ve_ao(a, nghieng=0, dy=0, gau=0, xoe=0, ngan=0):
    """áo choàng hình chuông, ngắn, che chân.
    nghieng: dịch phần trên ra trước (điểm); gau: −1/0/+1 vạt gấu lệch sau/trước (luân phiên khi chạy);
    xoe: gấu xoè thêm (nhảy/rơi); ngan: rút gấu lên (điểm)."""
    top, bot = AY - 19 + dy, AY - 4 - ngan + dy
    for y in range(top, bot + 1):
        t = (y - top) / max(1, bot - top)
        sh = round(nghieng * (1 - t))
        l = AX - 6 - round(4 * t ** 1.3) - (xoe if t > 0.7 else 0) + sh
        r = AX + 5 + round(3 * t ** 1.2) + (xoe if t > 0.7 else 0) + sh
        if y >= bot - 1:                      # vạt gấu lệch theo bước chân
            l += -1 if gau < 0 else (1 if gau > 0 else 0)
            r += 1 if gau > 0 else (0 if gau == 0 else -1)
        for x in range(l, r + 1):
            c = '3'
            if x <= l + 1: c = '4'                       # lưng tối
            elif x >= r: c = '2'                         # mép trước sáng
            if y == bot: c = '4'                         # gấu tối
            a.dat(x, y, c)
        # một nếp lớn
        fx = AX - 1 + round(1.5 * t) + sh + (gau if y > bot - 4 else 0)
        if t > 0.35 and y < bot:
            a.dat(fx, y, '4')
    # răng gấu rách lớn (2 khía)
    for kx in (AX - 4 + gau, AX + 3 + gau):
        a.dat(kx, bot, -1)
        a.dat(kx + 1, bot, -1)


def ve_ung(a, x, y, xa=False):
    """ủng nhỏ 4×3 (mũi quay phải). xa=True: chân phía sau (tối hơn)."""
    c1, c2 = ('V', 'k') if xa else ('W', 'V')
    a.ascii([f".{c1}{c1}.", f"{c1}{c1}{c1}{c1}", f"{c2}{c2}{c2}{c2}"], x, y)


def ve_khan(a, dx=0, dy=0):
    """khăn kem quấn cổ, đè lên mép dưới mũ (vẽ SAU đầu), viền mực trên/dưới."""
    x0, y0 = AX - 5 + dx, AY - 19 + dy
    a.ascii([".kccccccccck.",
             "kcccccccCCcCk",
             ".kCCCkkkkCCk.",
             "..kkk...kCk..",
             ".........kk.."], x0, y0)


def ve_khan_duoi(a, dx=0, dy=0, duoi=0):
    """đuôi khăn sau lưng (duoi: 0 rủ, 1 bay ngang, 2 bay cao) – thứ chuyển động phụ."""
    x0, y0 = AX - 5 + dx, AY - 19 + dy
    if duoi == 0:
        a.ascii(["cC", "cC", "cC", ".C"], x0 - 1, y0 + 1)
    elif duoi == 1:
        a.ascii(["cccc", "CCcc", "..CC"], x0 - 4, y0 + 1)
    else:
        a.ascii(["..cc", "cccC", "CC.."], x0 - 4, y0 - 1)


def ve_chuong(a, dx=0, dy=0):
    x0, y0 = AX - 2 + dx, AY - 17 + dy
    a.ascii(["..k..",
             ".kbk.",
             "kbbBk",
             "kbBnk",
             "kBBnk",
             ".kek.",
             "..k.."], x0, y0)


def ve_nia(a, gx, gy, huong, dai=8):
    """Âm Đao: cán gỗ ngắn + chắn đồng + hai nhánh bạc (khe 1 điểm).
    huong = (dx, dy) bước nguyên: (1,0) ngang, (1,1) chéo xuống, (1,-1) chéo lên, (0,-1) dựng, (2,1)… """
    hx, hy = huong
    n = max(abs(hx), abs(hy))
    # cán: 2 bước NGƯỢC hướng (phía sau tay)
    for i in range(1, 3):
        a.dat(gx - round(hx * i / n), gy - round(hy * i / n), 'V')
    # chắn đồng: vuông góc
    px, py = -hy, hx
    pn = max(abs(px), abs(py))
    px, py = round(px / pn), round(py / pn)
    for s in (-2, -1, 0, 1, 2):
        a.dat(gx + px * s + round(hx / n), gy + py * s + round(hy / n), 'B' if abs(s) < 2 else 'n')
    # hai nhánh
    for s, (c1, c2) in ((-1, ('s', 'S')), (1, ('S', 't'))):
        bx, by = gx + px * s + round(hx / n), gy + py * s + round(hy / n)
        for i in range(1, dai + 1):
            x, y = bx + round(hx * i / n), by + round(hy * i / n)
            a.dat(x, y, c1 if i < dai else 's')
            # độ dày bên dưới / bên phải
            a.dat(x - py * 0 + (0 if hy == 0 else 0), y + (1 if hy == 0 else 0), c2) if False else None
    # nét lõi giữa (khe) giữ trống – không vẽ


def ve_tay(a, vx, vy, gx, gy):
    """ống tay áo từ vai (vx,vy) tới găng (gx,gy): nét 2 điểm màu áo + găng nâu 2×2"""
    pts = a.duong(vx, vy, gx, gy, '3')
    for (x, y) in pts:
        a.dat(x, y + 1, '4')
    a.hcn(gx, gy, gx + 1, gy + 1, 'V')
    a.dat(gx + 1, gy, 'W')


# ---------------------------------------------------------------- DỰNG KHUNG
def khung(p):
    """p: dict tham số tư thế → Anh"""
    nen = Anh(OW, OH)
    dy = p.get('nhun', 0)
    # 1) lớp thân (có viền ngoài tự động): ủng xa, áo, ủng gần, đuôi khăn
    than = Anh(OW, OH)
    for (ux, uy, xa) in p['ung']:
        ve_ung(than, AX + ux, AY - 3 + uy, xa)
    ve_ao(than, p.get('nghieng', 0), dy, p.get('gau', 0), p.get('xoe', 0), p.get('ngan', 0))
    ve_khan_duoi(than, p.get('nghieng', 0), dy, p.get('duoi', 0))
    than.vien_ngoai('k')
    nen.dan(than, 0, 0)
    # 2) đầu (khoá điểm) + chuông
    hx, hy = p.get('dau', (0, 0))
    ve_dau(nen, hx + p.get('nghieng', 0), hy + dy)
    ve_khan(nen, p.get('nghieng', 0), dy)
    ve_chuong(nen, p.get('nghieng', 0), dy)
    # 3) tay + nĩa (lớp trước; 'sau' = lấy đà: vẽ SAU thân để không che mặt)
    tay = Anh(OW, OH)
    vx, vy = AX + (-3 if p.get('sau') else 4) + p.get('nghieng', 0), AY - 15 + dy
    gx, gy = AX + p['gang'][0], AY + p['gang'][1] + dy
    ve_tay(tay, vx, vy, gx, gy)
    tay.vien_ngoai('k')
    ve_nia(tay, gx + 1, gy, p['nia'], p.get('dai', 8))
    if p.get('sau'):
        tay.dan(nen, 0, 0); return tay
    nen.dan(tay, 0, 0)
    return nen


# Tư thế (đơn vị điểm ảnh; ung = [(dx so với AX, dy, xa)])
TU_THE = {
    # ĐỨNG thở: 2 hình, khác nhau 1 điểm (áo + tay xuống 1, đầu đứng yên)
    'dung0': dict(ung=[(-5, 0, True), (1, 0, False)], gang=(8, -11), nia=(1, 0)),
    'dung1': dict(ung=[(-5, 0, True), (1, 0, False)], gang=(8, -10), nia=(2, -1), ngan=-0, nhun=0, _tho=True),
    # CHẠY 6 hình: chạm – nhún – bay | chạm – nhún – bay (đổi chân)
    'chay0': dict(nghieng=1, ung=[(-7, 0, True), (4, 0, False)], gau=1, gang=(9, -12), nia=(1, 0), duoi=1),
    'chay1': dict(nghieng=1, nhun=1, ung=[(-6, -2, True), (1, 0, False)], gau=0, gang=(8, -12), nia=(1, 0), duoi=1),
    'chay2': dict(nghieng=1, ung=[(-3, -2, True), (2, -1, False)], gau=-1, gang=(8, -13), nia=(1, 0), duoi=2, ngan=1),
    'chay3': dict(nghieng=1, ung=[(3, 0, True), (-6, 0, False)], gau=-1, gang=(8, -12), nia=(1, 0), duoi=1),
    'chay4': dict(nghieng=1, nhun=1, ung=[(0, 0, True), (-5, -2, False)], gau=0, gang=(9, -12), nia=(1, 0), duoi=1),
    'chay5': dict(nghieng=1, ung=[(1, -1, True), (-2, -2, False)], gau=1, gang=(9, -13), nia=(1, 0), duoi=2, ngan=1),
    # CHÉM 1: lấy đà A1 A2 → ĐÁNH S → hồi R1 R2
    'chemA1': dict(nghieng=-1, ung=[(-5, 0, True), (2, 0, False)], gang=(-9, -17), nia=(-1, -1), duoi=0, sau=True),
    'chemA2': dict(nghieng=-1, nhun=1, ung=[(-6, 0, True), (3, 0, False)], gang=(-10, -20), nia=(0, -1), duoi=0, sau=True),
    'chemS':  dict(nghieng=2, ung=[(-6, 0, True), (5, 0, False)], gang=(11, -16), nia=(1, 0), duoi=1, gau=1, dai=9),
    'chemR1': dict(nghieng=2, nhun=1, ung=[(-6, 0, True), (5, 0, False)], gang=(10, -11), nia=(1, 1), duoi=1, gau=1, dai=7),
    'chemR2': dict(nghieng=1, ung=[(-5, 0, True), (3, 0, False)], gang=(9, -11), nia=(1, 0), duoi=0),
    # NHẢY / RƠI
    'nhay':  dict(ung=[(-4, -2, True), (1, -3, False)], gang=(8, -14), nia=(1, -1), duoi=0, ngan=1),
    'roi':   dict(ung=[(-5, 0, True), (2, 1, False)], gang=(8, -16), nia=(1, -1), duoi=2, xoe=1),
}


def vong_cung(loai):
    """cung chém pixel trùng hộp chém 1 ([4,-97,86,48] logic so với chân, mặt phải).
    Trả Anh cỡ ô + vị trí; loai 'day' (đầy) | 'tan' (đang tan)."""
    a = Anh(OW + 20, OH)
    # hộp theo điểm ảnh (so với neo AX, AY)
    bx0, by0 = AX + round(4 / LOGIC), AY + round(-97 / LOGIC)
    bx1, by1 = AX + round((4 + 86) / LOGIC) - 1, AY + round((-97 + 48) / LOGIC) - 1
    cx, cy = bx0 + 2, by1 + 6               # tâm cung: sau-dưới → cung quét từ trên-sau xuống trước
    R1x, R1y = (bx1 - cx) + 0.5, (cy - by0) + 0.5
    for y in range(by0, by1 + 1):
        for x in range(bx0, bx1 + 1):
            u, v = (x - cx) / R1x, (y - cy) / R1y
            d = u * u + v * v
            if d > 1.0:
                continue
            # vành trong lệch lên-trước → lưỡi liềm dày ở trước, mỏng ở trên
            u2, v2 = (x - cx + 1) / (R1x - 5), (y - cy - 1) / (R1y - 4.5)
            d2 = u2 * u2 + v2 * v2
            if d2 < 1.0:
                continue
            if x < AX + 2 and y > by0 + 3:
                continue
            t = (x - bx0) / max(1, bx1 - bx0)    # 0 sau → 1 trước
            if loai == 'tan':
                if t < 0.45 or (x + y) % 3 == 0:
                    continue
            c = 's' if d > 0.78 else ('c' if d > 0.5 else '1')
            if loai == 'tan':
                c = 'c' if c == 's' else '1'
            a.dat(x, y, c)
    return a, (bx0, by0, bx1, by1)


def main():
    out = os.path.join(GOC, 'sprite'); os.makedirs(out, exist_ok=True)
    kiem = os.path.join(GOC, 'kiem'); os.makedirs(kiem, exist_ok=True)
    ten = list(TU_THE)
    hinh = {}
    for t in ten:
        p = TU_THE[t]
        hinh[t] = khung(p)
    # đứng thở: dung1 = dung0 nhưng áo/tay hạ 1 điểm, đầu giữ → dựng riêng bằng cách nhún thân, khoá đầu
    p = dict(TU_THE['dung0']); p['nhun'] = 1; p['dau'] = (0, -1)   # đầu bù −1 ⇒ đầu đứng yên, thân thở 1 điểm
    hinh['dung1'] = khung(p)
    cung = {l: vong_cung(l) for l in ('day', 'tan')}
    # sheet: một hàng các khung + 2 ô cung
    n = len(ten)
    sh = Anh(OW * n + (OW + 20) * 2, OH)
    meta = {'o': [OW, OH], 'neo': [AX, AY], 'diem_logic': LOGIC, 'khung': {}, 'cung': {},
            'ghi_chu': 'neo = giữa collider (x) và mặt đất (y) trong ô; vẽ ô tại (chân_x/3 − neo_x, chân_y/3 − neo_y) điểm ảnh. '
                       'Mặt phải; quay trái thì lật quanh neo.'}
    for i, t in enumerate(ten):
        sh.dan(hinh[t], i * OW, 0)
        meta['khung'][t] = [i * OW, 0, OW, OH]
    x = OW * n
    for l in ('day', 'tan'):
        a, box = cung[l]
        sh.dan(a, x, 0)
        meta['cung'][l] = {'o': [x, 0, a.w, a.h], 'hop_diem': list(box)}
        x += a.w
    sh.luu(os.path.join(out, 'lam-pixel.png'))
    meta['dau'] = {'ascii': DAU, 'mat': [MAT_DX, MAT_DY]}
    json.dump(meta, open(os.path.join(out, 'lam-pixel.json'), 'w'), ensure_ascii=False, indent=1)
    sh.luu(os.path.join(kiem, 'lam-pixel-x8.png'), 8)
    print('ok', n, 'khung')


if __name__ == '__main__':
    main()
