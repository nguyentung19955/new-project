#!/usr/bin/env python3
"""ẢNH SOÁT Lần 2 — thương quét khung 6 thay ảnh gen lại (17/10/2026). KHÔNG chạy game: dựng khung y như js/zed_moi.js bằng
thuong-tay-trai-cao/soat.py (ve_zed.py của vk-khop-tay). TRƯỚC = ?thuongcao=0 (= game trước lần này: khung 6 chưa từng nâng),
SAU = bảng game/js/thuong_cao_data.js (khung 6 ảnh mới + neo mới). Đo cầm nắm khung 6 mới bằng cam-vk-chuan/do_cam.py (4 cấp).
Ra (thư mục này): gif-quet-x3.gif (đứng → quét 6 khung → đứng, trái TRƯỚC | phải SAU, ×3, thương cấp Trắng),
                  gif-quet-cap4-x3.gif (như trên, cấp Thức tỉnh), k6-x4.png (khung 6: thân trơn + cầm thương 4 cấp, trên TRƯỚC / dưới SAU, ×4),
                  k6-to-x4.png (khung 6 mới: bản thường 96 | bản to ×1,2 | bản BOX ?netcu=1, ×4).
Chạy (từ gốc repo): python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/quet-k6/soat_k6.py"""
import copy, os, sys
import numpy as np
from PIL import Image, ImageDraw

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(DAY))
import sua as SU  # noqa: E402  (thuong-tay-trai-cao/sua.py; nó nạp cam-vk-chuan/soat.py dưới tên "soat")
import importlib.util  # noqa: E402
SC = sys.modules['soat']  # cam-vk-chuan/soat.py
_s = importlib.util.spec_from_file_location('soat_cao', os.path.join(os.path.dirname(DAY), 'soat.py'))
SO = importlib.util.module_from_spec(_s); _s.loader.exec_module(SO)  # thuong-tay-trai-cao/soat.py
DC = SU.DC

K, I = 'thuong_quet', 5
NEN = (52, 58, 70, 255)


def do_k6(T, V):
    """Đo cầm nắm khung 6 (4 cấp): trước (tấm + neo cũ) và sau (ảnh + neo mới, như game)."""
    print('Đo cầm nắm khung 6 quét (cam-vk-chuan/do_cam.py):')
    for ten, TT in (('TRƯỚC', T), ('SAU', None)):
        if TT is None:
            TT = dict(T); TT['dong_tac'] = copy.deepcopy(T['dong_tac']); TT['_img'] = T['_img'].copy()
            SC.ap_anh_thay(TT)
        for cap in range(4):
            r = DC.do_khung(TT, V, K, I, cap)
            print('  %-5s cấp %d: neo %s  lỗi %s  tâm nắm đo P=%s  tay hai T=%s' % (
                ten, cap + 1, TT['dong_tac'][K]['nam']['neo'][I], r['loi'] or 'không',
                tuple(round(x, 1) for x in r['P'][:2]) if r.get('P') else '-', tuple(round(x, 1) for x in r['T'][:2]) if r.get('T') else '-'))


def main():
    T, V, SUA = SU.tai()
    B = SO.doc_bang()
    do_k6(T, V)
    # GIF ×3: đứng (2 khung) → quét 6 khung → đứng
    for ten, cap in (('gif-quet-x3.gif', 0), ('gif-quet-cap4-x3.gif', 3)):
        chuoi = [('dung~16_thuong', 0), ('dung~16_thuong', 2)] + [(K, i) for i in range(6)] + [('dung~16_thuong', 0)]
        anh = []
        for k, i in chuoi:
            a, _ = SO.khung(T, V, SUA, B, k, i, False, 3, cap)
            b, doi = SO.khung(T, V, SUA, B, k, i, True, 3, cap)
            a, b = SO.cat(a, 3), SO.cat(b, 3)
            f = Image.new('RGB', (a.width * 2 + 6, a.height + 16), (25, 25, 30))
            f.paste(a, (0, 16)); f.paste(b, (a.width + 6, 16))
            d = ImageDraw.Draw(f)
            d.text((4, 2), 'TRUOC  %s k%d' % (k, i + 1), fill=(230, 230, 230))
            d.text((a.width + 10, 2), 'SAU' + ('  (khung 6 anh moi)' if (k, i) == (K, I) else ''), fill=(120, 230, 120))
            anh.append(f.convert('P', palette=Image.ADAPTIVE, colors=255))
        dur = [140] * len(anh); dur[2 + I] = 420  # dừng lâu hơn ở khung 6 để dễ xem
        anh[0].save(os.path.join(DAY, ten), save_all=True, append_images=anh[1:], duration=dur, loop=0, optimize=True)
        print('Ghi', ten)
    # khung 6 ×4: cột 0 thân trơn, cột 1..4 cầm thương 4 cấp; hàng trên TRƯỚC, dưới SAU
    Z = 4
    o = []
    for sau in (False, True):
        hang = []
        r = B['bo']['zed-moi'][K]['khung'][str(I)] if sau else None
        than = SO.o_anh(r['anh'])[0] if sau else SU.o96(T['_img'], T['dong_tac'][K]['hang'], I)
        tr = Image.new('RGBA', ((96 + 2 * SO.VZ.PAD) * Z,) * 2, (0, 0, 0, 0))
        tr.alpha_composite(Image.fromarray(than).resize((96 * Z, 96 * Z), Image.NEAREST), (SO.VZ.PAD * Z, SO.VZ.PAD * Z))
        hang.append(SO.cat(tr, Z))
        for cap in range(4):
            im, _ = SO.khung(T, V, SUA, B, K, I, sau, Z, cap)
            hang.append(SO.cat(im, Z))
        o.append(hang)
    w, h = o[0][0].size
    P = Image.new('RGB', (5 * (w + 4), 2 * h + 44), (25, 25, 30))
    d = ImageDraw.Draw(P)
    d.text((4, 2), 'Thuong quet khung 6 (thu the) x4 - tren: TRUOC, duoi: SAU (anh gen lai). Cot 1: than tron; cot 2-5: cap Trang, Mam, Thanh hinh, Thuc tinh', fill=(235, 235, 235))
    for r_, hang in enumerate(o):
        for c_, im in enumerate(hang):
            P.paste(im, (c_ * (w + 4), 20 + r_ * (h + 4)))
    P.save(os.path.join(DAY, 'k6-x4.png'), optimize=True)
    print('Ghi k6-x4.png')
    # bản thường | bản to | BOX (?netcu=1), cùng cỡ hiển thị (×4 ô 96)
    r = B['bo']['zed-moi'][K]['khung'][str(I)]
    ba = [SO.o_anh(r['anh'], t)[0] for t in ('tam', 'to', 'cu')]
    W = 96 * 5
    Q = Image.new('RGB', (3 * (W + 6), W + 20), (25, 25, 30))
    d = ImageDraw.Draw(Q)
    for j, (a, nhan) in enumerate(zip(ba, ('ban thuong 96 (net)', 'ban to x1,2 (116, net)', 'BOX cu (?netcu=1)'))):
        im = Image.new('RGBA', a.shape[1::-1], NEN); im.alpha_composite(Image.fromarray(a))
        Q.paste(im.convert('RGB').resize((W, W), Image.NEAREST), (j * (W + 6), 20))
        d.text((j * (W + 6) + 4, 4), nhan, fill=(235, 235, 235))
    Q.save(os.path.join(DAY, 'k6-to-x4.png'), optimize=True)
    print('Ghi k6-to-x4.png')


if __name__ == '__main__':
    main()
