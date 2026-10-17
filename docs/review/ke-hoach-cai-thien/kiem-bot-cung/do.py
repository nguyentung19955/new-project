"""KIẾM BỚT CỨNG — số đo + GIF TRƯỚC / SAU từ các tệp quay.py (17/10).
  python3 docs/review/ke-hoach-cai-thien/kiem-bot-cung/do.py <truoc.npz> <sau.npz> <tat.npz>
truoc = bản dist trước phiên này (git show HEAD:game/dist/linh-khi.html), sau = bản mới, tat = bản mới với ?kiemmuot=0.
Ra (thư mục này): kiem-<n>-truoc-sau.gif (trái TRƯỚC, phải SAU; trên kiếm cấp 1, dưới cấp 4; đúng thời lượng: 60 nhịp logic/giây,
bỏ 1 nhịp mỗi 6 nhịp → 50 hình/giây × 20 ms), so-do.json.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))


def doc(p):
    z = np.load(p)
    return {'0': z['a0'], '3': z['a3']}, json.loads(str(z['so']))


def doan(nh):  # khoảng nhịp liền của từng nhát (đang đánh: có góc kiếm): [hàng, đầu, cuối]
    ds = []
    for k, r in enumerate(nh):
        t = r['ten'] if r['goc'] is not None and (r['ten'] or '').startswith('kiem_') else None
        if t and ds and ds[-1][0] == t and ds[-1][2] == k - 1: ds[-1][2] = k
        elif t: ds.append([t, k, k])
    return ds


def so_do(nh, a, b):
    g = [nh[k]['goc'] for k in range(a, b + 1)]
    u = [nh[k]['u'] for k in range(a, b + 1)]
    m = [nh[k]['mui'] for k in range(a, b + 1)]
    v = [abs(((g[k + 1] - g[k] + 540) % 360) - 180) for k in range(len(g) - 1)]
    kmax = int(np.argmax(v))
    # "khựng": nhịp kiếm gần đứng yên (< 3°/nhịp) nằm giữa hai nhịp đang vung nhanh (> 15°/nhịp) trong lúc vung (u < 0,65)
    khung = sum(1 for k in range(1, len(v) - 1) if v[k] < 3 and u[k] < 0.65 and max(v[:k]) > 15 and max(v[k + 1:]) > 15)
    return {'nhay_lon_nhat_do_moi_nhip': round(max(v), 1), 'luc_nhanh_nhat_u': round((u[kmax] + u[kmax + 1]) / 2, 2),
            'so_nhip_khung': khung, 'mui_thap_nhat_duoi_dat_px': round(max(m), 1)}


def main():
    A0, J0 = doc(sys.argv[1]); A1, J1 = doc(sys.argv[2]); A2, J2 = doc(sys.argv[3])
    out = {'loi_trang': {'truoc': J0['loi_trang'], 'sau': J1['loi_trang'], 'tat': J2['loi_trang']},
           'loi_zed': {'truoc': J0['loi_zed'], 'sau': J1['loi_zed'], 'tat': J2['loi_zed']}, 'nhat': {}}
    # ?kiemmuot=0 giống TRƯỚC tới từng điểm ảnh?
    out['tat_giong_truoc_diem_anh_khac'] = {c: int((A0[c] != A2[c]).any(axis=-1).sum()) for c in A0}
    nh0 = J0['so']['0']['nhip']
    for (ten, a, b) in doan(nh0):
        n = ten[-1]
        r = {}
        for c in ('0', '3'):
            r['cap%d' % (int(c) + 1)] = {'truoc': so_do(J0['so'][c]['nhip'], a, b), 'sau': so_do(J1['so'][c]['nhip'], a, b),
                                         'tat': so_do(J2['so'][c]['nhip'], a, b)}
        out['nhat']['kiem_' + n] = r
        # GIF
        k0, k1 = max(0, a - 6), min(len(nh0) - 1, b + 10)
        ks = [k for k in range(k0, k1 + 1) if (k - k0) % 6 != 5]
        H, W = A0['0'].shape[1], A0['0'].shape[2]
        frs = []
        for k in ks:
            cv = Image.new('RGBA', (W * 2 + 6, H * 2 + 6 + 22), (58, 60, 72, 255))
            for ci, c in enumerate(('0', '3')):
                for xi, A in enumerate((A0, A1)):
                    cv.alpha_composite(Image.fromarray(A[c][k]), (xi * (W + 6), 22 + ci * (H + 6)))
            d = ImageDraw.Draw(cv)
            for xi, t in enumerate(('TRUOC', 'SAU')):
                d.text((xi * (W + 6) + 6, 5), t, fill=(255, 255, 255))
            r0 = nh0[k]
            star = r0['u'] is not None and 0.45 <= r0['u'] < 0.5
            d.text((cv.width - 140, 5), 'kiem %s  u=%.2f%s' % (n, max(r0['u'], 0) if r0['goc'] is not None else 0, ' *' if star else ''), fill=(255, 220, 90) if star else (200, 200, 200))
            d.line([(0, 22 + int(70 * 3)), (cv.width, 22 + int(70 * 3))], fill=(90, 160, 90))
            d.line([(0, 22 + H + 6 + int(70 * 3)), (cv.width, 22 + H + 6 + int(70 * 3))], fill=(90, 160, 90))
            frs.append(cv.convert('RGB').quantize(colors=128, method=Image.Quantize.MEDIANCUT))
        p = os.path.join(HERE, 'kiem-%s-truoc-sau.gif' % n)
        frs[0].save(p, save_all=True, append_images=frs[1:], duration=20, loop=0, optimize=True)
        print('Đã ghi', p, len(frs), 'hình')
    json.dump(out, open(os.path.join(HERE, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
