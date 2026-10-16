"""Giữ LIỀN mảng da như tấm cũ (cho máy đo cầm vũ khí cam-vk-chuan/do_cam.py): tấm nét mới không còn điểm lửng nên đôi chỗ một mảng da cũ
(ví dụ cằm + cổ áo hình chữ V) tách thành hai mảng; mảng nhỏ 4–40 điểm nằm trên trục cán bị máy đo hiểu nhầm là "tay thứ hai bị cán đè".
Chỉ sửa đúng ô có mảng da bị tách (mảng mới 4–40 điểm nằm trọn trong một mảng cũ > 40 điểm): tô lại bằng màu da gần nhất các điểm
ngăn cách (điểm thuộc mảng cũ, giáp cả hai mảng mới). Chỉ tấm thường (máy đo đọc tấm này); in số điểm đã tô.
python3 noi_da.py [mã,…] [hàng,…]"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'docs/review/ke-hoach-cai-thien/cam-vk-chuan'))
import do_cam as DC
import thu_net
CUS = os.path.join(REPO, 'game', 'art', 'custom')
MA = sys.argv[1].split(',') if len(sys.argv) > 1 else ['zed-moi', 'zed-rung', 'zed-bien', 'zed-lau']
HANG = sys.argv[2].split(',') if len(sys.argv) > 2 else None
S8 = np.ones((3, 3))
for ma in MA:
    p = os.path.join(CUS, ma + '.sprite.json'); d = json.load(open(p, encoding='utf-8'))
    c = json.load(open(os.path.join(CUS, ma + '-netcu.sprite.json'), encoding='utf-8'))
    im = np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))
    cu = np.array(Image.open(io.BytesIO(base64.b64decode(c['tam'].split(',', 1)[1]))).convert('RGBA'))
    hs = sorted({da['hang'] for k, da in d['dong_tac'].items() if isinstance(da, dict) and 'hang' in da and (not HANG or k in HANG)})
    to = 0
    for r in hs:
        for i in range(im.shape[1] // 96):
            a = im[r * 96:(r + 1) * 96, i * 96:(i + 1) * 96]; b = cu[r * 96:(r + 1) * 96, i * 96:(i + 1) * 96]
            if not a[..., 3].any():
                continue
            ma_m, ma_c = DC.da_mask(a), DC.da_mask(b)
            lm, n = ndimage.label(ma_m, S8); lc, nc = ndimage.label(ma_c, S8)
            for k in range(1, n + 1):
                v = lm == k; sz = int(v.sum())
                if not 4 <= sz <= 40:
                    continue
                kc = np.bincount(lc[v], minlength=nc + 1); kc[0] = 0
                q = int(kc.argmax())
                if q == 0 or (lc == q).sum() <= 40:
                    continue
                cung = (lc == q) & ma_m & ~v                     # phần mới khác của mảng cũ
                if not cung.any():
                    continue
                gan = ndimage.binary_dilation(v, S8) & ndimage.binary_dilation(cung, S8) & (lc == q) & ~ma_m
                if not gan.any():  # không giáp trực tiếp: nối bằng đường ngắn nhất trong mảng cũ
                    dv = ndimage.distance_transform_edt(~v); dcg = ndimage.distance_transform_edt(~cung)
                    tong = np.where((lc == q) & ~ma_m, dv + dcg, 1e9); y, x = np.unravel_index(tong.argmin(), tong.shape)
                    gan = np.zeros_like(v); gan[y, x] = True
                ys, xs = np.nonzero(ma_m)
                for y, x in zip(*np.nonzero(gan)):
                    j = np.argmin((ys - y) ** 2 + (xs - x) ** 2)
                    a[y, x] = a[ys[j], xs[j]]; to += 1
    if to:
        d['tam'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(im)).decode()
        json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(ma, 'tô', to, 'điểm')
