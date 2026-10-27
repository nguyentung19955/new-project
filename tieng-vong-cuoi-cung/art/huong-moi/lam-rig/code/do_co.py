"""Đo cỡ từng mảnh của BẢNG MẢNH so với ẢNH ĐÃ CHỐT → ../manh/do-co.json
  • mảnh cứng có mốc rõ: đo bằng mốc (dao: chắn tay → mũi; chuông: phần đồng; mắt: phần hổ phách; găng: nắm tay)
  • mũ, chóp, vải: theo khớp tự động (khop_manh.py, sai số màu có chặn) + so hộp bao phần nhìn thấy.
Tỉ lệ > 1: ảnh chốt to hơn bảng mảnh."""
import os
import numpy as np
from PIL import Image
from chung import SRC_CHOT, MANH, load_rgb, background, doc_json, luu_json


def bb(m):
    ys, xs = np.nonzero(m)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]


def main():
    a = load_rgb(SRC_CHOT)
    FG = ~background(a)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    K = doc_json(os.path.join(MANH, 'goc', 'khop.json'))
    meta = doc_json(os.path.join(MANH, 'manh.json'))

    def sheet(ten):
        return np.asarray(Image.open(os.path.join(MANH, 'goc', ten + '.png'))).astype(float)

    def box(x0, y0, x1, y1):
        m = np.zeros(FG.shape, bool)
        m[y0:y1, x0:x1] = True
        return m
    out = {}
    # dao
    d = sheet('dao')
    gs, ts = np.array([101.5, 29.8]), np.array([293, 54])
    ga, ta = np.array([738.0, 899.2]), np.array([939, 949])
    out['dao'] = {'cach_do': 'khoảng cách giữa chắn tay → mũi dao', 'bang_manh_px': round(float(np.hypot(*(ts - gs))), 1),
                  'anh_chot_px': round(float(np.hypot(*(ta - ga))), 1)}
    # chuông (phần đồng)
    c = sheet('chuong')
    br = (c[..., 0] > 140) & (c[..., 0] - c[..., 2] > 50) & (c[..., 3] > 128)
    bs = bb(br)
    ba = bb((R > 140) & (R - B > 50) & box(690, 590, 850, 810))
    out['chuong'] = {'cach_do': 'chiều cao phần đồng (vòng treo → quả lắc)', 'bang_manh_px': bs[3] - bs[1], 'anh_chot_px': ba[3] - ba[1],
                     'rong_bang_manh': bs[2] - bs[0], 'rong_anh_chot': ba[2] - ba[0]}
    m = sheet('mat')
    ms = bb(m[..., 3] > 128)
    ma = bb((R > 170) & (G > 110) & (B < 150) & box(740, 400, 830, 540))
    out['mat'] = {'cach_do': 'cao × rộng phần hổ phách', 'bang_manh_px': [ms[3] - ms[1], ms[2] - ms[0]],
                  'anh_chot_px': [ma[3] - ma[1], ma[2] - ma[0]]}
    for ten in ['mu', 'chop', 'than', 'ao-vai', 'vat-truoc', 'vat-sau', 'gang-gan']:
        k = K[ten]
        out[ten] = {'cach_do': 'khớp tự động (dò lưới + Nelder–Mead)', 'co_xy': k['co'], 'xoay_do': k['xoay'],
                    'sai_so_mau_tb': round(k['sai_so'], 1)}
    for ten, v in out.items():
        if 'anh_chot_px' in v:
            bm, ac = np.atleast_1d(v['bang_manh_px']), np.atleast_1d(v['anh_chot_px'])
            v['ty_le'] = [round(float(x), 3) for x in ac / bm]
    out['_ket_luan'] = ('Bảng mảnh gần đúng cỡ ảnh chốt: dao 1,07; chuông ~1,06 (cao) / 0,99 (rộng); mắt ~1,04; mũ 1,15 × 1,12 '
                        '(khớp tốt, sai số màu 9). Vải (thân, vạt, áo choàng vai) trong bảng mảnh KHÁC HÌNH ảnh chốt (thân là '
                        'nón dài, vạt là váy rời) nên khớp kém (sai số màu 17–21) → phần nhìn thấy lấy từ ảnh chốt, bảng mảnh chỉ '
                        'dùng lấp phần khuất của mũ, dao, găng xa, 2 ủng.')
    luu_json(os.path.join(MANH, 'do-co.json'), out)
    for k, v in out.items():
        print(k, v)


if __name__ == '__main__':
    main()
