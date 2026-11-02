"""(camgiac) Đo hộp trúng theo HÌNH THẬT của đòn Kiếm Khách và (tuỳ chọn) ghi vào nhan-vat.json.
Hộp mới = khung bao phần KIẾM + HIỆU ỨNG (màu xanh lam) của mọi khung trúng, nới 4 điểm ảnh mỗi phía,
rồi cắt cho không vượt khung bao toàn bộ hình (người + kiếm + hiệu ứng). Mọi Cấp dùng cùng hình → cùng hộp.
Riêng mũi phía trước không ngắn hơn TRUOC_MIN (Đòn 3 vẽ vệt chém vòng sau lưng – nếu bám đúng hình thì đòn 3 của combo trượt quái trước mặt).
Chạy: python3 tools/cam-giac-hop-trung.py        (chỉ in bảng)
      python3 tools/cam-giac-hop-trung.py --ghi  (ghi vào game/thu-mat-na/nhan-vat.json)
      python3 tools/cam-giac-hop-trung.py --kiem (mã thoát 1 nếu hộp nào vượt phần hình nhìn thấy)"""
import json, sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'muot-2'))
from ghi_json import dump
GOC = os.path.join(os.path.dirname(__file__), '..')
NV = os.path.join(GOC, 'game/thu-mat-na/nhan-vat.json')
DEM = 4
TRUOC_MIN = 36   # công bằng: mũi đòn đất tối thiểu 36 điểm ảnh phía trước (= mũi kiếm Đòn 2). Chỉ Đòn 3 / Chéo xuống (vệt chém vòng ra SAU lưng) bị nâng lên mức này

def bao(folder, frames, chan, cyan):
    X0 = Y0 = 10 ** 9; X1 = Y1 = -10 ** 9
    for k in frames:
        A = np.array(Image.open(os.path.join(GOC, 'art/kiem-khach', folder, 'f%02d.png' % k)).convert('RGBA')).astype(int)
        m = A[..., 3] > 20
        if cyan: m &= (A[..., 2] > A[..., 0] + 40) & (A[..., 1] > A[..., 0] + 20)
        ys, xs = np.nonzero(m)
        if not len(xs): continue
        X0 = min(X0, xs.min()); X1 = max(X1, xs.max() + 1); Y0 = min(Y0, ys.min()); Y1 = max(Y1, ys.max() + 1)
    return [int(X0 - chan[0]), int(Y0 - chan[1]), int(X1 - X0), int(Y1 - Y0)]

def hop_moi(c):
    a = bao(c['thu_muc'], c['trung'], c['chan'], False)
    b = bao(c['thu_muc'], c['trung'], c['chan'], True)
    x0 = max(a[0], b[0] - DEM); y0 = max(a[1], b[1] - DEM)
    x1 = min(a[0] + a[2], b[0] + b[2] + DEM); y1 = min(a[1] + a[3], b[1] + b[3] + DEM)
    if x1 < TRUOC_MIN: x1 = TRUOC_MIN
    return [x0, y0, x1 - x0, y1 - y0], a

def vuot(h, a):   # hộp h vượt khung hình a bao nhiêu điểm ảnh (lớn nhất 4 phía)
    return max(a[0] - h[0], a[1] - h[1], (h[0] + h[2]) - (a[0] + a[2]), (h[1] + h[3]) - (a[1] + a[3]), 0)

def main():
    txt = open(NV, encoding='utf-8').read(); d = json.loads(txt)
    ds = [('', k, c) for k, c in d['clip'].items() if 'hop' in c]
    ds += [(cap.get('ten', str(i)), k, c) for i, cap in enumerate(d['cap']) for k, c in cap['clip'].items() if 'hop' in c]
    loi = 0; T = 2 * d.get('co', 1) * 0.85   # px logic / điểm ảnh (ti_le × co × 0,85 như nap.js)
    print('| Đòn | Cấp | Hộp trước [x, y, rộng, cao] | Hộp mới | Mũi phía trước (px màn) trước | mới | Vượt hình (điểm ảnh) trước → mới |')
    print('|---|---|---|---|---|---|---|')
    for cap, k, c in ds:
        moi, a = hop_moi(c); cu = c['hop']
        if '--kiem' in sys.argv:
            v = vuot(cu, a)
            if k != 'dapdat' and cu[0] + cu[2] <= TRUOC_MIN and v <= TRUOC_MIN - (a[0] + a[2]): v = 0   # phần nâng mũi tối thiểu (công bằng) được phép
            if v > 0: loi += 1; print('LỖI', cap or '-', k, 'hộp', cu, 'vượt hình', a, v, 'điểm ảnh')
            continue
        print('| %s | %s | %s | %s | %d | %d | %d → %d |' % (k, cap or '-', cu, moi, round((cu[0] + cu[2]) * T), round((moi[0] + moi[2]) * T), vuot(cu, a), vuot(moi, a)))
        if '--ghi' in sys.argv: c['hop'] = moi
    if '--ghi' in sys.argv: open(NV, 'w', encoding='utf-8').write(dump(txt, d) + ('\n' if txt.endswith('\n') else ''))
    if '--kiem' in sys.argv:
        print('TẤT CẢ ĐẠT: mọi hộp trúng nằm trong phần hình nhìn thấy' if not loi else 'Hỏng %d' % loi); sys.exit(1 if loi else 0)
main()
