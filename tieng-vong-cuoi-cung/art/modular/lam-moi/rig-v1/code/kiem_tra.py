"""Kiểm tra tự động: JSON đủ khoá, mọi ảnh mảnh tồn tại & là RGBA, cây xương không vòng, thứ tự vẽ đủ mảnh,
không còn viền trắng (điểm ảnh bán trong suốt mà sáng), ủng chạm đất không lún, dao không chồng ủng,
gốc chóp mũ không lộ khi lắc ±10°. In kết quả, mã thoát 1 nếu có lỗi."""
import os
import sys
import json
import numpy as np
from PIL import Image
from chung import RIG, JSON_PATH, TU_THE, load_json
from rig import render

loi = []


def ok(cond, msg):
    print(('  OK  ' if cond else '  LỖI ') + msg)
    if not cond:
        loi.append(msg)


def main():
    d = load_json()
    for k in ('quy_uoc', 'manh', 'rig', 'tu_the'):
        ok(k in d, f'JSON có khoá {k}')
    rig = d['rig']
    nut = rig['nut']
    # cây
    for n, v in nut.items():
        seen, c = set(), n
        while c is not None:
            if c in seen:
                break
            seen.add(c)
            c = nut[c]['cha']
        ok(c is None, f'nút {n}: lần ngược tới gốc không vòng')
    co_anh = sorted(n for n, v in nut.items() if 'anh' in v)
    ok(sorted(rig['thu_tu_ve']) == co_anh, 'thứ tự vẽ chứa đúng mọi nút có ảnh (10 mảnh)')
    ok(len(co_anh) == 10, f'số mảnh có ảnh = {len(co_anh)} (9 mảnh bảng + mắt xa)')
    # ảnh
    for n in co_anh:
        p = os.path.join(RIG, nut[n]['anh'])
        if not os.path.isfile(p):
            ok(False, f'{p} tồn tại')
            continue
        im = Image.open(p)
        ok(im.mode == 'RGBA', f'{n}.png là RGBA')
        a = np.array(im).astype(int)
        semi = (a[..., 3] > 10) & (a[..., 3] < 245)
        bright = semi & (a[..., :3].min(-1) > 200)
        if n.startswith('mat'):
            bright = semi & (a[..., 2] > 200)       # mắt vàng: viền trắng = kênh xanh lam cao
        ok(bright.sum() <= 3, f'{n}: điểm viền trắng bán trong suốt = {int(bright.sum())} (≤ 3)')
        ok(list(im.size) == d['manh'][n]['co'], f'{n}: cỡ ảnh khớp JSON {im.size}')
    # tư thế
    sl = json.load(open(os.path.join(TU_THE, 'so-lieu.json'), encoding='utf-8'))
    for n, s in sl['tu_the'].items():
        ok(s['day_px_anh_ngang'] <= 1.0, f'{n}: điểm thấp nhất không lún quá 1 px dưới đất ({s["day_px_anh_ngang"]})')
        if 'chong_tay_dao_va_ung_px' in s:
            ok(s['chong_tay_dao_va_ung_px'] == 0, f'{n}: tay dao không chồng lên ủng')
        ok(abs(s['cao_112_px'] - 112) <= 4, f'{n}: cao ở 112 px = {s["cao_112_px"]}')
    for g, v in sl['chop_mu_lac'].items():
        ok(v['lo_trong_px'] == 0, f'chóp {g}°: không có lỗ thủng giữa mũ và chóp')
    for n, p in d['tu_the'].items():
        ok(abs(p['chop-mu']['goc']) <= 10, f'{n}: chóp lắc trong ±10° ({p["chop-mu"]["goc"]})')
    # gốc chóp khuất ở ±10°
    a = np.array(Image.open(os.path.join(RIG, nut['chop-mu']['anh'])))[..., 3] > 128
    xs = np.nonzero(a.any(0))[0]
    for g in (-10, 0, 10):
        p = {'chop-mu': {'goc': g}}
        box = (0, 0, 1000, 800)
        mu = np.array(render(rig, p, box, only=['mu'])[0])[..., 3] > 128
        # chỉ vẽ phần gốc: tạm che ảnh chóp
        from rig import _cache, piece_img
        key = os.path.join(RIG, nut['chop-mu']['anh'])
        orig = piece_img(nut['chop-mu']['anh'], RIG).copy()
        m = orig.copy()
        m[:, :int(xs.max() - 0.30 * (xs.max() - xs.min()))] = 0
        _cache[key] = m
        goc = np.array(render(rig, p, box, only=['chop-mu'])[0])[..., 3] > 128
        _cache[key] = orig
        lo = float((goc & ~mu).sum() / max(goc.sum(), 1))
        ok(lo < 0.05, f'chóp {g:+d}°: phần gốc lộ ra ngoài mũ {lo * 100:.1f} % (< 5 %)')
    print('\nKẾT QUẢ:', 'ĐẠT' if not loi else f'{len(loi)} lỗi')
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
