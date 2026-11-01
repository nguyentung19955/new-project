# -*- coding: utf-8 -*-
"""Luồng I (P0-05): QA cỡ nhân vật Kiếm Khách giữa các clip trong art/kiem-khach (KHÔNG tự scale gì).
Mỗi clip lấy khung "đứng thẳng nhất" (tỉ lệ cao/rộng bbox thân lớn nhất), đo và so với clip 'dung':
  - cao thân   : bbox cao của thân sau khi bỏ FX cyan sáng (cyan + lõi trắng-xanh) và hạt rời (chỉ giữ khối liền lớn nhất)
  - cao giáp   : như trên nhưng bỏ cả pixel kem tóc/mặt nạ (đo phần giáp tối, ít bị tóc bay ảnh hưởng)
  - trung vị   : trung vị chỉ số tóc+mặt nạ trên mọi khung của clip (tham khảo, đỡ nhiễu khi khung đứng thẳng bị che tóc)
  - tóc+mặt nạ : căn bậc hai diện tích pixel kem tóc + mặt nạ (cách đo cũ, quy về tỉ lệ dài) – ít phụ thuộc tư thế nhất
Cờ: lệch > 8% ở chỉ số tóc+mặt nạ (chỉ số chính). Hai chỉ số cao chỉ để tham khảo vì phụ thuộc tư thế (ngồi/cúi/nằm).
Chạy: python3 tools/kiem-tra-co-nhan-vat.py [--md]"""
import os, sys, glob, numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
KK = os.path.join(GOC, 'art/kiem-khach')
NGUONG = 8.0

def phan_loai(a):
    r, g, b, al = (a[..., i] for i in range(4)); op = al > 0
    cyan = (((b - r >= 30) & (b >= 80)) | ((b >= r) & (a[..., :3].min(-1) >= 225))) & op
    L = 0.299 * r + 0.587 * g + 0.114 * b
    kem = op & ~cyan & (L >= 150) & (r >= b)          # tóc kem + mặt nạ trắng ngà
    return op, cyan, kem

def khoi_lon(m):
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=1), structure=np.ones((3, 3)))
    if n == 0: return m
    sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); return m & (lab == 1 + int(np.argmax(sz)))

def do(f):
    a = np.array(Image.open(f).convert('RGBA')).astype(int); op, cyan, kem = phan_loai(a)
    than = khoi_lon(op & ~cyan)
    if not than.any(): return None
    ys, xs = np.nonzero(than); h = ys.max() - ys.min() + 1; w = xs.max() - xs.min() + 1
    giap = than & ~ndimage.binary_dilation(kem, iterations=1)   # bỏ cả viền 1px quanh tóc
    yg = np.nonzero(giap)[0]; hg = (yg.max() - yg.min() + 1) if len(yg) else 0
    return dict(h=h, w=w, hg=hg, km=float(np.sqrt((kem & than).sum())), tl=h / w)

def main():
    md = '--md' in sys.argv; kq = {}
    for d in sorted(os.listdir(KK)):
        fs = sorted(glob.glob(os.path.join(KK, d, 'f*.png')))
        ds = [(os.path.basename(f)[:-4], do(f)) for f in fs]; ds = [x for x in ds if x[1]]
        if ds:
            fn, m = max(ds, key=lambda x: x[1]['tl']); m = dict(m, kmtv=float(np.median([x[1]['km'] for x in ds]))); kq[d] = (fn, m)
    g = kq['dung'][1]; pc = lambda v, r: (v / r - 1) * 100
    hang = []
    for d, (fn, m) in kq.items():
        a, b, c = pc(m['h'], g['h']), pc(m['hg'], g['hg']), pc(m['km'], g['km'])
        e = pc(m['kmtv'], g['kmtv'])
        hang.append((d, fn, m['h'], a, m['hg'], b, c, abs(c) > NGUONG, e))
    if md:
        print('| clip | khung | cao thân px | lệch | cao giáp px | lệch | tóc+mặt nạ (√S) lệch | trung vị cả clip | cờ >8% |\n|---|---|---|---|---|---|---|---|---|')
        for d, fn, h, a, hg, b, c, co, e in hang: print(f'| {d} | {fn} | {h} | {a:+.1f}% | {hg} | {b:+.1f}% | {c:+.1f}% | {e:+.1f}% | {"**LỆCH**" if co else ""} |')
    else:
        print(f'{"clip":10} {"khung":5} {"cao":>4} {"lệch":>7} {"giáp":>4} {"lệch":>7} {"tóc+mn":>7} {"tv clip":>7}  cờ')
        for d, fn, h, a, hg, b, c, co, e in hang: print(f'{d:10} {fn:5} {h:4d} {a:+6.1f}% {hg:4d} {b:+6.1f}% {c:+6.1f}% {e:+6.1f}%  {"LỆCH >8%" if co else ""}')
    lech = [x[0] for x in hang if x[7]]
    print('\nClip lệch >8% (tóc+mặt nạ):', ', '.join(lech) if lech else 'không có')

if __name__ == '__main__': main()
