"""GIF đúng tốc độ + chậm x3 + tấm chuỗi khung: mỗi hệ x (Mầm, Thức tỉnh) x (trúng 1, trúng 3, trượt), đòn mẫu (mặc định kiếm 3 nhát).
Chạy: python3 gif.py <thư mục ra> [them=&hemoi=0]   biến môi trường: DON=cham3 WT=sword N=90"""
import sys, os
from lib import *
from PIL import Image
RA = sys.argv[1]; THEM = sys.argv[2] if len(sys.argv) > 2 else ''
WT = os.environ.get('WT', 'sword'); DON = os.environ.get('DON', 'cham3'); N = int(os.environ.get('N', '90'))
BAC = [int(x) for x in os.environ.get('BAC', '1,3').split(',')]
TEN_BAC = {0: 'trang', 1: 'mam', 2: 'thanh-hinh', 3: 'thuc-tinh'}
TEN_HE = {'fire': 'lua', 'poison': 'doc', 'ice': 'bang'}
os.makedirs(RA, exist_ok=True)
def luu(ims, ten):
    big = Image.new('RGB', (ims[0].width, ims[0].height * len(ims)))
    for i, im in enumerate(ims): big.paste(im, (0, i * ims[0].height))
    pal = big.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)  # một bảng màu chung cho cả GIF: nhỏ hơn ~2 lần
    q = [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in ims]
    du = [30 if i % 3 != 2 else 40 for i in range(len(q))]  # mỗi khung = 2 nhịp game = 33,3 ms; GIF tính theo 10 ms nên xen 30/30/40 (trung bình đúng 33,3)
    q[0].save(os.path.join(RA, ten + '.gif'), save_all=True, append_images=q[1:], duration=du, loop=0, optimize=True)
    q[0].save(os.path.join(RA, ten + '-cham-x3.gif'), save_all=True, append_images=q[1:], duration=100, loop=0, optimize=True)
    # tấm chuỗi khung: 1 khung / 4 nhịp game (66 ms), 6 cột
    ch = ims[::2][:24]; W, H = ch[0].size; cot = 6
    s = Image.new('RGB', (W * cot, H * ((len(ch) + cot - 1) // cot)), (0, 0, 0))
    for i, im in enumerate(ch): s.paste(im, ((i % cot) * W, (i // cot) * H))
    s = s.resize((s.width // 2, s.height // 2), Image.NEAREST)
    s.save(os.path.join(RA, ten + '-khung.png'), optimize=True)
with sync_playwright() as p:
    b, g, loi = mo(p, THEM)
    for el in ('fire', 'poison', 'ice'):
        for st in BAC:
            for bia in ('mot', 'ba', 'truot'):
                r = g.evaluate("(o) => HE.chay(o)", {'wt': WT, 'el': el, 'st': st, 'don': DON, 'n': N, 'bia': bia, 'chup': True, 'chupMoi': 2, 'chupW': 176, 'chupH': 100, 'chupK': 2})
                ten = '%s-%s-%s-%s' % (WT, TEN_HE[el], TEN_BAC[st], {'mot': 'trung-1', 'ba': 'trung-3', 'truot': 'truot'}[bia])
                luu(anh(r['anh']), ten)
                print(ten, len(r['anh']), flush=True)
    print('pageerror:', loi or 'không có')
    b.close()
