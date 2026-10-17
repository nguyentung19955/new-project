#!/usr/bin/env python3
"""P1 – VẼ PIXEL ART THEO MẪU GỐC: sprite Lam CHUẨN (tư thế đứng) 64×64, pivot [32,63], cao 46 px.

Cách làm (lặp lại được): toàn bộ sprite là MỘT bản đồ ký tự 64×64 (BAN_DO, ghi từng ô theo toạ độ cột/hàng) vẽ tay
theo mẫu gốc art/nhan-vat/lam-48/nguyen-con-v2-mat-sang.png (mẫu thu về 46 px cao, lưới 64, xem out/danh-gia/goc-64.png
và lưới tham chiếu ×40 do script này xuất ra) – KHÔNG scale/xoay tự động, KHÔNG blur. Mỗi ký tự = (màu trong bảng 12 màu,
bộ phận). Chuông + khoen + dây là lớp phủ riêng (CHUONG) đè lên mũ/vai để lớp mũ bên dưới vẫn nguyên.
Lớp (lop/*.png) cắt từ bản đồ theo bộ phận: ô màu của bộ phận + ô viền #0C0F14 kề cạnh; ô viền không kề ô màu nào được
gán cho bộ phận gần nhất (BFS) để ghép lại TRÙNG TỪNG PIXEL (script tự kiểm).

Xuất: art/nhan-vat/lam-ve-tay/ – lam-chuan.png, -x4, -x8, lop/*.png + lop.json, lop-x4.png, so-sanh.png, trong-game-x1/x4,
lat-x4.png, kiem-tra.json. Chạy: python3 proto-lam/ve-tay/lam-chuan.py
"""
import importlib.util
import json
import os
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.normpath(os.path.join(HERE, '..'))
ROOT = os.path.normpath(os.path.join(PROTO, '..'))
OUT = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-ve-tay')
GOC = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-48', 'nguyen-con-v2-mat-sang.png')
GOC64 = os.path.join(PROTO, 'out', 'danh-gia', 'goc-64.png')

PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
RGB = {h: (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255) for h in PAL}
VIEN, AO0, AO1, AO2, XAM, X0, X1, X2, V0, V1, V2, SANG = [RGB[h] for h in PAL]
NEN = (42, 36, 51, 255)
PIVOT = (32, 63)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

# ký tự → (màu, bộ phận). 'K' = viền #0C0F14 dùng chung (gán lớp theo ô màu kề cạnh); 'k'/'o' = #0C0F14 thuộc hẳn một bộ phận
KY_TU = {
    '.': (None, None), 'K': (VIEN, None),
    # mũ (H): thân mũ #2C3546, bóng/nếp #212835, mép xanh, điểm sáng góc mũ, khoang mặt đen
    '3': (AO2, 'H'), '2': (AO1, 'H'), 'g': (X1, 'H'), 'l': (X2, 'H'), 'k': (VIEN, 'H'),
    # mắt (E)
    'W': (V2, 'E'),
    # chuông + khoen + dây (B)
    'Y': (V1, 'B'), 'w': (V2, 'B'), 'b': (V0, 'B'), 'o': (VIEN, 'B'),
    # thân: áo trong xám + điểm sáng, đai chéo, trâm (vòng sáng + tâm xanh), áo thân xanh + điểm sáng (T)
    't': (AO2, 'T'), 'h': (XAM, 'T'), 's': (AO0, 'T'), 'r': (V2, 'T'), 'q': (X1, 'T'), 'G': (X1, 'T'), 'L': (X2, 'T'),
    # tay gần: ống tay + găng xám sáng + điểm sáng cổ tay (N)
    'n': (AO2, 'N'), 'u': (XAM, 'N'), 'c': (V2, 'N'),
    # tay xa + kiếm: ống tay, bàn tay, chắn vàng (+ điểm sáng, bóng), lưỡi (F)
    'f': (AO1, 'F'), 'v': (AO2, 'F'), 'y': (V1, 'F'), 'z': (V0, 'F'), 'x': (V2, 'F'), 'C': (SANG, 'F'), 'e': (X1, 'F'),
    # áo choàng sau: vải tối, dải mép sáng hơn, lót xanh (A)
    'a': (AO0, 'A'), 'A': (AO2, 'A'), 'i': (X1, 'A'),
    # áo choàng trước (quấn qua vai gần, vạt trước): vai, vải tối, lót xanh (P)
    'P': (AO2, 'P'), 'p': (AO0, 'P'), 'j': (X1, 'P'),
    # chân gần + ủng: quần, ủng, vạch/mũi xanh, khoá (L)
    '9': (AO2, 'L'), '7': (AO1, 'L'), 'S': (X1, 'L'), 'U': (XAM, 'L'),
    # chân xa + ủng (X)
    '6': (AO1, 'X'), '5': (AO0, 'X'), 'Z': (X1, 'X'), 'V': (XAM, 'X'),
}
LOP_TEN = {'A': 'ao-choang-sau', 'F': 'tay-xa+kiem', 'X': 'chan-xa+ung', 'L': 'chan-gan+ung', 'T': 'than+dai+tram',
           'P': 'ao-choang-truoc', 'N': 'tay-gan', 'H': 'mu-dau', 'E': 'mat', 'B': 'chuong+day+khoen'}
Z_ORDER = ['A', 'F', 'X', 'L', 'T', 'P', 'N', 'H', 'E', 'B']   # vẽ từ sau ra trước

# ---------------------------------------------------------------- BẢN ĐỒ (hàng: [(cột bắt đầu, chuỗi), ...])
BAN_DO = {
    18: [(27, 'KKKKK')],
    19: [(25, 'KK333ggK')],
    20: [(23, 'KK333333ggK')],
    21: [(22, 'KKK3333333ggK')],
    22: [(21, 'KKK333333333ggKK')],
    23: [(20, 'K2K33333333333gggK')],
    24: [(19, 'K22K333333333333gllK')],
    25: [(19, 'K22K333333333322ggg2K')],
    26: [(19, 'K22K33333333322ggkk2K')],
    27: [(19, 'K22K3333333322ggkkk2K')],
    28: [(19, 'K222223333322ggkkkk2K')],
    29: [(19, 'K22222333322ggkkkkk2K')],
    30: [(19, 'K2222233322ggkWkkkk2K')],
    31: [(19, 'K222223322ggkkWkWkk2K')],
    32: [(19, 'K22222322ggkkkkkWkk2K')],
    33: [(19, 'K2222222ggkkkkkkkkk2K')],
    34: [(19, 'K22K222gggggkkkkkkk2K')],
    35: [(19, 'K2K222ggKhhhgggkkk22K')],
    36: [(19, 'K2222ggKhhhhhttK2222K')],
    37: [(19, 'K222ggKKKsshhtKKKKKK')],
    38: [(19, 'KKKKKKPPKttsstrrrtK')],
    39: [(18, 'KPPPPPPPPPPjjssrqrtK')],
    40: [(17, 'KPPPPPPPPjjjttttrrrtK')],
    41: [(16, 'KAaaaaajjjjppppGGGGGGK')],
    42: [(15, 'KAAaajjjpppjjppLLGGGGGKK')],
    43: [(15, 'KAAjjaannnpppjGLLGGGGKffKKK'), (51, 'KKKKK')],
    44: [(14, 'KAAaaaannnnnpppjLLLGGGKffKxyK'), (46, 'KKKKK'), (51, 'CCCCCK')],
    45: [(13, 'KAAaaaaannnuuuuKGLLLGGGKffKxyKKKKCCCCCeeeeK')],
    46: [(13, 'KAAaaaaiiKuuuuuKGLLLGGGKffKyyKCCCCCCCCKKKKK')],
    47: [(12, 'KAAaaaaiiaKuuuuuKGLLLGGGKffKyyKCCCeeeeeK')],
    48: [(11, 'KAAaaaiiiiaKcuuuuKGLLGGGGKvvKyyKeeeKKKKK')],
    49: [(11, 'KAaaaiiiiiaKcuuuKGGLGGGGGKvvKKyzKKK')],
    50: [(10, 'KAaaiiaaiiaapKKKKKGGGGGGGGKvvKKyzK')],
    51: [(10, 'KAiiaaaiiaapppppppGGGGGGGGKvvKKyzK')],
    52: [(9, 'KiiiaaaiiaaaKKKKKKKGGKGGGKGKKKKKyzK')],
    53: [(9, 'KiiaaaaiiaaaK99999KKKKKGK6K6K'), (41, 'KK')],
    54: [(10, 'KiaaaiiaaaKK99999K..K6K6666K')],
    55: [(11, 'KKKaiiaaK.K99999K..K666666K')],
    56: [(13, 'KiiaaK..K9SSSSK..K6ZZZZZK')],
    57: [(13, 'KiiaK...K77SSSK..KVV555ZK')],
    58: [(13, 'KiiK....KUU777K..KV5555ZK')],
    59: [(14, 'KiK....K77777K..K555555K')],
    60: [(15, 'K.....K777SSK..K555555K')],
    61: [(21, 'KUU777K..K555VV5ZK')],
    62: [(21, 'K7777SSK.K55555ZZZK')],
    63: [(21, 'KKKKKKKK.KKKKKKKKKK')],
}
# lớp phủ chuông + khoen + dây (đè lên mũ/vai; K ở đây thuộc lớp B)
CHUONG = {
    28: [(17, 'KK')],
    29: [(16, 'KYYK')],
    30: [(15, 'KYooYK')],
    31: [(15, 'KYooYK')],
    32: [(16, 'KYYK')],
    33: [(17, 'KK')],
    34: [(16, 'KYYYK')],
    35: [(15, 'KwYYYbK')],
    36: [(14, 'KwwYYYbK')],
    37: [(14, 'KwwwYbbK')],
    38: [(13, 'KbbbwbbbbK')],
    39: [(14, 'KKKKKKKK')],
}


def dung_ban_do():
    """→ mảng ký tự 64×64 (chuỗi), kiểm tra ký tự hợp lệ"""
    m = [['.'] * 64 for _ in range(64)]
    for y, ds in BAN_DO.items():
        for x0, s in ds:
            for i, ch in enumerate(s):
                assert ch in KY_TU, (y, x0 + i, ch)
                if ch != '.': m[y][x0 + i] = ch
    for y, ds in CHUONG.items():
        for x0, s in ds:
            for i, ch in enumerate(s):
                assert ch in KY_TU, (y, x0 + i, ch)
                if ch != '.': m[y][x0 + i] = ('o' if ch == 'K' else ch)
    return m


def to_rgba(m):
    a = np.zeros((64, 64, 4), np.uint8)
    for y in range(64):
        for x in range(64):
            c = KY_TU[m[y][x]][0]
            if c is not None: a[y, x] = c
    return a


N4 = ((0, 1), (0, -1), (1, 0), (-1, 0))


def tach_lop(m):
    """→ {bộ phận: mask bool 64×64}; ô viền dùng chung ('K') gán cho mọi bộ phận có ô màu kề cạnh, ô 'K' mồ côi → BFS tới bộ phận gần nhất"""
    bp = [[KY_TU[m[y][x]][1] for x in range(64)] for y in range(64)]
    mask = {p: np.zeros((64, 64), bool) for p in Z_ORDER}
    for y in range(64):
        for x in range(64):
            p = bp[y][x]
            if p: mask[p][y, x] = True
    # ô 'K' kề ô màu của bộ phận → thuộc bộ phận đó (viền ngoài của lớp)
    for y in range(64):
        for x in range(64):
            if m[y][x] != 'K': continue
            for dy, dx in N4:
                yy, xx = y + dy, x + dx
                if 0 <= yy < 64 and 0 <= xx < 64 and bp[yy][xx] and m[yy][xx] not in 'Kko':
                    mask[bp[yy][xx]][y, x] = True
    # ô 'K' mồ côi: BFS từ mọi ô đã có chủ qua các ô 'K'
    chu = [[None] * 64 for _ in range(64)]
    q = deque()
    for p in Z_ORDER:
        for y, x in zip(*np.nonzero(mask[p])):
            chu[y][x] = p; q.append((y, x))
    mo_coi = 0
    while q:
        y, x = q.popleft()
        for dy, dx in N4:
            yy, xx = y + dy, x + dx
            if 0 <= yy < 64 and 0 <= xx < 64 and m[yy][xx] == 'K' and chu[yy][xx] is None:
                chu[yy][xx] = chu[y][x]; mask[chu[y][x]][yy, xx] = True; q.append((yy, xx)); mo_coi += 1
    return mask, mo_coi


def ghep(m, mask):
    a = to_rgba(m); out = np.zeros_like(a)
    for p in Z_ORDER:
        out[mask[p]] = a[mask[p]]
    return out


def kiem_pixel_le(a):
    """đốm 1 px: pixel màu (không viền) mà 4 lân cận đều khác màu nó"""
    le = []
    for y in range(64):
        for x in range(64):
            if a[y, x, 3] == 0 or tuple(a[y, x]) == VIEN: continue
            if all(not (0 <= y + dy < 64 and 0 <= x + dx < 64) or tuple(a[y + dy, x + dx]) != tuple(a[y, x]) for dy, dx in N4): le.append((y, x))
    return le


def kiem_vien_ngoai(a):
    """pixel màu (không phải #0C0F14) kề ô trong suốt → vi phạm viền ngoài 1 px"""
    vp = []
    for y in range(64):
        for x in range(64):
            if a[y, x, 3] == 0 or tuple(a[y, x]) == VIEN: continue
            for dy, dx in N4:
                yy, xx = y + dy, x + dx
                if not (0 <= yy < 64 and 0 <= xx < 64) or a[yy, xx, 3] == 0: vp.append((y, x)); break
    return vp


def chu(c):
    return ImageFont.truetype(FONT, c)


def x_n(im, s):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def luoi_tham_chieu():
    """mẫu gốc thu về 46 px cao, lưới 64 ×40 có toạ độ – chỉ để vẽ tay đối chiếu (không dùng làm sprite)"""
    g = np.array(Image.open(GOC).convert('RGB')).astype(int)
    nen = (g[..., 0] > 180) & (g[..., 2] > 180) & (g[..., 1] < 120)
    im = Image.fromarray(np.dstack([g.astype(np.uint8), np.where(nen, 0, 255).astype(np.uint8)]), 'RGBA'); im = im.crop(im.getbbox())
    K = 24; big = Image.new('RGBA', (64 * K, 64 * K), NEN)
    big.alpha_composite(im.resize((46 * K, 46 * K), Image.LANCZOS), (10 * K, 18 * K))
    d = ImageDraw.Draw(big); f = chu(9)
    for i in range(65):
        col = (255, 255, 255, 70) if i % 4 else (255, 255, 0, 160)
        d.line([(i * K, 0), (i * K, 64 * K)], fill=col); d.line([(0, i * K), (64 * K, i * K)], fill=col)
    for i in range(0, 64, 4):
        for j in range(0, 64, 4): d.text((j * K + 2, i * K + 1), '%d,%d' % (i, j), font=f, fill=(255, 255, 255, 255))
    return big.crop((6 * K, 16 * K, 58 * K, 64 * K))


def main():
    os.makedirs(os.path.join(OUT, 'lop'), exist_ok=True)
    m = dung_ban_do(); a = to_rgba(m)
    mask, mo_coi = tach_lop(m)
    sprite = Image.fromarray(a, 'RGBA')
    sprite.save(os.path.join(OUT, 'lam-chuan.png'))
    x_n(sprite, 4).save(os.path.join(OUT, 'lam-chuan-x4.png')); x_n(sprite, 8).save(os.path.join(OUT, 'lam-chuan-x8.png'))
    # lớp
    ghep_lai = ghep(m, mask)
    trung = bool(np.array_equal(ghep_lai, a))
    for p in Z_ORDER:
        la = np.zeros_like(a); la[mask[p]] = a[mask[p]]
        Image.fromarray(la, 'RGBA').save(os.path.join(OUT, 'lop', LOP_TEN[p] + '.png'))
    # điểm neo (x=cột, y=hàng) đo trên bản đồ
    neo = {'pivot': [32, 63], 'vaiGan': [23, 43], 'vaiXa': [38, 43], 'khuyuGan': [21, 45], 'coTayGan': [24, 47], 'coTayXa': [38, 48],
           'chuoiKiem': [41, 47], 'hongGan': [24, 53], 'hongXa': [34, 53], 'goiGan': [24, 57], 'goiXa': [34, 57], 'coChanGan': [24, 61], 'coChanXa': [34, 61],
           'co': [31, 36], 'mocChuong': [19, 30], 'tramNguc': [34, 39]}
    lop_json = {'kichThuoc': [64, 64], 'pivot': [32, 63], 'thuTuVe': [LOP_TEN[p] for p in Z_ORDER],
                'lop': {LOP_TEN[p]: {'tep': 'lop/%s.png' % LOP_TEN[p], 'soPixel': int(mask[p].sum()),
                                     'hop': [int(v) for v in Image.fromarray((mask[p] * 255).astype(np.uint8)).getbbox()]} for p in Z_ORDER},
                'diemNeo': neo, 'ghepTrungTungPixel': trung, 'ghiChu': 'toạ độ [x, y] pixel trong ô 64; lớp = ô màu của bộ phận + viền #0C0F14 kề cạnh; ghép theo thuTuVe (sau→trước) ra đúng lam-chuan.png'}
    json.dump(lop_json, open(os.path.join(OUT, 'lop.json'), 'w'), ensure_ascii=False, indent=1)
    # lop-x4: từng lớp tách rời + ghép
    S = 4; cot = 6; hang = 2; W = cot * (64 * S + 8) + 8; H = hang * (64 * S + 30) + 8
    im = Image.new('RGBA', (W, H), NEN); d = ImageDraw.Draw(im); f = chu(11)
    for k, p in enumerate(Z_ORDER + ['*']):
        x = 8 + (k % cot) * (64 * S + 8); y = 28 + (k // cot) * (64 * S + 30)
        if p == '*': la = ghep_lai; ten = 'ghép 10 lớp theo thứ tự (trùng từng pixel lam-chuan: %s)' % ('ĐẠT' if trung else 'KHÔNG')
        else: la = np.zeros_like(a); la[mask[p]] = a[mask[p]]; ten = '%d.%s (%d px)' % (k, LOP_TEN[p], int(mask[p].sum()))
        im.alpha_composite(x_n(Image.fromarray(la, 'RGBA'), S), (x, y)); d.rectangle([x, y, x + 64 * S - 1, y + 64 * S - 1], outline=(70, 80, 95, 255))
        d.text((x, y - 20), ten, font=f, fill=(230, 230, 230, 255))
    im.save(os.path.join(OUT, 'lop-x4.png'))
    # so-sanh: mẫu gốc thu 64 | sprite | ×8
    goc = Image.open(GOC64).convert('RGBA')
    S8 = 8; W = 64 + 8 + 64 + 8 + 64 * S8 + 8 + 64 * S8 + 24; H = 64 * S8 + 40
    im = Image.new('RGBA', (W, H), NEN); d = ImageDraw.Draw(im)
    im.alpha_composite(goc, (8, 28)); d.text((8, 8), 'gốc thu 64', font=f, fill=(230, 230, 230, 255))
    im.alpha_composite(sprite, (80, 28)); d.text((80, 8), 'lam-chuan', font=f, fill=(230, 230, 230, 255))
    im.alpha_composite(x_n(goc, S8), (152, 28)); d.text((152, 8), 'gốc thu 64 ×8', font=f, fill=(230, 230, 230, 255))
    im.alpha_composite(x_n(sprite, S8), (152 + 64 * S8 + 8, 28)); d.text((152 + 64 * S8 + 8, 8), 'lam-chuan ×8', font=f, fill=(230, 230, 230, 255))
    im.save(os.path.join(OUT, 'so-sanh.png'))
    # trong game ×1 / ×4
    spec = importlib.util.spec_from_file_location('build', os.path.join(PROTO, 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json')))
    q = atlas['quaiChuong']; qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
    f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h'])); qp = q['pivot']
    nen.alpha_composite(sprite, (380 - PIVOT[0], DAT - PIVOT[1]))
    nen.alpha_composite(quai, (457 - qp['x'], DAT - qp['y']))
    nen.save(os.path.join(OUT, 'trong-game-x1.png')); x_n(nen, 4).save(os.path.join(OUT, 'trong-game-x4.png'))
    # lật ngang (kiểm kiếm vẫn ở tay xa khi quay trái)
    lat = sprite.transpose(Image.FLIP_LEFT_RIGHT)
    im = Image.new('RGBA', (64 * 4 * 2 + 24, 64 * 4 + 40), NEN); d = ImageDraw.Draw(im)
    im.alpha_composite(x_n(sprite, 4), (8, 28)); d.text((8, 8), 'quay phải (gốc) – kiếm tay xa', font=f, fill=(230, 230, 230, 255))
    im.alpha_composite(x_n(lat, 4), (64 * 4 + 16, 28)); d.text((64 * 4 + 16, 8), 'lật ngang – kiếm vẫn tay xa', font=f, fill=(230, 230, 230, 255))
    im.save(os.path.join(OUT, 'lat-x4.png'))
    # lưới tham chiếu (để vẽ tay tiếp)
    luoi_tham_chieu().save(os.path.join(OUT, 'tham-chieu-luoi.png'))
    # số liệu
    op = a[..., 3] > 0; ys, xs = np.nonzero(op)
    mau = {tuple(v) for v in a[op]}
    so = {'kichThuoc': [64, 64], 'hop': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'cao': int(ys.max() - ys.min() + 1), 'rong': int(xs.max() - xs.min() + 1),
          'pivot': [32, 63], 'chanChamHang63': bool(op[63].any()), 'soMau': len(mau), 'ngoaiBang': ['#%02X%02X%02X' % c[:3] for c in mau if '#%02X%02X%02X' % c[:3] not in PAL],
          'alpha': sorted({int(v) for v in a[..., 3].ravel()}), 'soPixel': int(op.sum()), 'pixelLe': kiem_pixel_le(a), 'viPhamVienNgoai': kiem_vien_ngoai(a),
          'ghepLopTrungTungPixel': trung, 'oVienMoCoiGanBFS': mo_coi, 'pixelMoiLop': {LOP_TEN[p]: int(mask[p].sum()) for p in Z_ORDER},
          'demMau': {h: int(((a[..., 0] == RGB[h][0]) & (a[..., 1] == RGB[h][1]) & (a[..., 2] == RGB[h][2]) & op).sum()) for h in PAL}}
    json.dump(so, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(so, ensure_ascii=False))


if __name__ == '__main__': main()
