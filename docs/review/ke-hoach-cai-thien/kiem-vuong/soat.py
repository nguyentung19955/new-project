#!/usr/bin/env python3
"""KIẾM VUÔNG — ảnh soát (17/10). KHÔNG chơi thử: mọi hình lấy bằng bot headless (kiem-nang/quay.py, bấm J theo kịch bản cố định).
Chạy từ gốc repo sau khi build:
  python3 docs/review/ke-hoach-cai-thien/kiem-vuong/soat.py quay <trang html> <ra.npz> [cờ url]     (quay 4 cấp kiếm)
  python3 docs/review/ke-hoach-cai-thien/kiem-vuong/soat.py anh <truoc.npz> <sau.npz>               (dựng ảnh soát)
    truoc.npz = quay trên bản dist trước phiên này (hoặc ?kiemvuong=0), sau.npz = bản mới (mặc định).
Ra (thư mục này):
  luoi-kiem-vuong.png       10 khung kiếm nặng × 4 cấp (×3), hình Cu Tí THẬT trong game (đã qua chặn đất, đường góc liền) ở đúng
                            mốc khung; ★ = khung chạm; vạch xanh = mặt đất; số đỏ = điểm ảnh lọt dưới đất (0 = không xuyên đất)
  combo-vet-x1.gif / -x3.gif, combo-vet-cap4-x3.gif   combo 3 nhát có vệt chém (khung cắt từ màn trận thật), đúng thời lượng
  truoc-sau-x3.gif          Cu Tí riêng: trái kiếm cũ, phải kiếm vuông; trên cấp 1, dưới cấp 4
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
KN = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-nang')
CAP = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh']
HANG = [('kiem_1', 4, 3, [0, 0.15, 0.3, 0.45]), ('kiem_2', 3, 1, [0, 0.45, 0.72]), ('kiem_3', 3, 1, [0, 0.45, 0.72])]


def quay(trang, ra, co=''):
    src = open(os.path.join(KN, 'quay.py'), encoding='utf-8').read()
    src = src.replace("CAP = (0,) if '--mot-cap' in sys.argv else (0, 3)", 'CAP = (0, 1, 2, 3)')
    sys.argv = ['quay.py', trang, ra] + ([co] if co else [])
    g = {'__name__': '__main__', '__file__': os.path.join(KN, 'quay.py')}
    exec(compile(src, os.path.join(KN, 'quay.py'), 'exec'), g)


def luoi(sau):
    z, so = sau
    sys.path.insert(0, KN)
    import soat as KS  # noqa: E402
    F = KS.L.F
    cw, ch = 120 * 3, 90 * 3
    nhan_w, top = 96, 40
    out = Image.new('RGBA', (nhan_w + 10 * cw, top + 4 * ch), (34, 38, 48, 255))
    d = ImageDraw.Draw(out)
    d.text((6, 4), 'Kiếm vuông — kiếm nặng 10 khung × 4 cấp (×3), hình thật trong game (bot). ★ = khung chạm. Vạch xanh = mặt đất. '
           'Số = điểm ảnh lọt dưới đất.', fill=(235, 235, 235), font=F)
    tong = 0
    for cap in range(4):
        nh = so['so'][str(cap)]['nhip']; A = z['a%d' % cap]
        c = 0
        for ten, n, sao, moc in HANG:
            for i in range(n):
                u0 = moc[i]; u1 = moc[i + 1] if i + 1 < n else 1.0
                um = u0 + (u1 - u0) * (0.8 if i == sao else 0.5)
                ks = [k for k, r in enumerate(nh) if r['ten'] == ten and r['i'] == i and r['u'] is not None and r['u'] >= 0]
                if not ks:
                    c += 1; continue
                k = min(ks, key=lambda k: abs(nh[k]['u'] - um))
                o = Image.new('RGBA', (cw, ch), (52, 58, 72, 255)); o.alpha_composite(Image.fromarray(A[k]))
                duoi = int((A[k][211:, :, 3] > 0).sum()); tong += duoi
                q = ImageDraw.Draw(o)
                q.line([(0, 210), (cw, 210)], fill=(90, 220, 110, 255))
                q.text((4, ch - 16), 'u %.2f  dưới đất: %d' % (nh[k]['u'], duoi), fill=(255, 120, 120) if duoi else (200, 200, 200), font=F)
                if i == sao:
                    q.rectangle([0, 0, cw - 1, ch - 1], outline=(255, 220, 90, 255), width=2)
                out.alpha_composite(o, (nhan_w + c * cw, top + cap * ch))
                if cap == 0:
                    d.text((nhan_w + c * cw + 4, 22), 'khung %d%s · nhát %d' % (c + 1, ' ★' if i == sao else '', HANG.index((ten, n, sao, moc)) + 1),
                           fill=(255, 220, 90) if i == sao else (210, 210, 210), font=F)
                c += 1
        d.text((6, top + cap * ch + ch // 2 - 8), 'cấp %d\n%s' % (cap + 1, CAP[cap]), fill=(230, 230, 230), font=F)
    out.convert('RGB').save(os.path.join(HERE, 'luoi-kiem-vuong.png'), optimize=True)
    print('Ghi luoi-kiem-vuong.png', out.size, 'điểm ảnh dưới đất (tổng 40 ô):', tong)


def anh(truoc_p, sau_p):
    sys.path.insert(0, KN)
    import soat as KS  # noqa: E402
    KS.HERE = HERE
    truoc, sau = KS.doc(truoc_p), KS.doc(sau_p)
    luoi(sau)
    KS.gif_man(sau, 'combo-vet-x1.gif', '0', 1)
    KS.gif_man(sau, 'combo-vet-x3.gif', '0', 3)
    KS.gif_man(sau, 'combo-vet-cap4-x3.gif', '3', 3)
    import inspect
    g = {}
    code = inspect.getsource(KS.gif_truoc_sau).replace('TRƯỚC (kiếm cũ)', 'TRƯỚC (kiếm cũ, ?kiemvuong=0)').replace('SAU (kiếm nặng)', 'SAU (kiếm vuông)')
    exec(code, KS.__dict__, g)
    g['gif_truoc_sau'](truoc, sau, 'truoc-sau-x3.gif')


if __name__ == '__main__':
    if sys.argv[1] == 'quay':
        quay(os.path.abspath(sys.argv[2]), os.path.abspath(sys.argv[3]), sys.argv[4] if len(sys.argv) > 4 else '')
    else:
        anh(sys.argv[2], sys.argv[3])
