"""Thẻ ô ải: docs/anh-goc/giao-dien/the-o-ai-6.png (2 hàng × 3: thường / đang chọn / khoá; hàng trên ô thường, hàng dưới ô trùm)
-> gd-the-ai, -chon, -khoa và gd-the-trum, -chon, -khoa. python3 dung-the-ai.py [--ghi]
Tách nền: nền = vùng nối với mép ảnh có α (unmix) < 0,6; ở nền và dải 2 điểm sát nền lấy α tách màu (bỏ viền xanh, giữ quầng sáng
vàng / lửa của thẻ đang chọn ở dạng bán trong), bên trong giữ nguyên (rêu xanh của thẻ không bị làm trong).
Cỡ game (net 2): ô thường cao 28, ô trùm cao 38 — cả 3 trạng thái cùng một hệ số co và cùng ô ảnh (để chồng khít nhau).
In ra điểm neo = tâm mặt đồng (chỗ game viết số ải) theo tỉ lệ ảnh."""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tach_xanh import unmix, thu_rgba
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
src = np.array(Image.open(os.path.join(DAY, 'docs/anh-goc/giao-dien/the-o-ai-6.png')).convert('RGB'))
H, W = src.shape[:2]; cw, ch = W // 3, H // 2
TEN = [['gd-the-ai', 'gd-the-ai-chon', 'gd-the-ai-khoa'], ['gd-the-trum', 'gd-the-trum-chon', 'gd-the-trum-khoa']]
NHAN = ['thường', 'đang chọn', 'khoá']
CAO = [28, 38]
neo = {}
# 6 thẻ: khối liền lớn nhất (sau khi nới 6 điểm) — thẻ trùm cao hơn nửa ảnh và lấn sang cột bên, nên không cắt theo lưới đều
_u = unmix(src); _m = ndimage.binary_dilation(_u[..., 3] > 40, iterations=6)
_lb, _n = ndimage.label(_m); _sz = ndimage.sum(_m, _lb, range(1, _n + 1)); _ob = ndimage.find_objects(_lb)
_k6 = sorted(np.argsort(_sz)[::-1][:6], key=lambda i: (_ob[i][0].start > H * 0.42, _ob[i][1].start))
O = max(max(_ob[i][0].stop - _ob[i][0].start, _ob[i][1].stop - _ob[i][1].start) for i in _k6)
def o_the(j):
    i = _k6[j]; sl = _ob[i]; cy = (sl[0].start + sl[0].stop) // 2; cx = (sl[1].start + sl[1].stop) // 2
    y0, x0 = cy - O // 2, cx - O // 2
    rgb = np.zeros((O, O, 3), np.uint8); rgb[..., 1] = 248; rgb[..., 0] = 3; rgb[..., 2] = 13
    ky0, kx0 = max(0, y0), max(0, x0); ky1, kx1 = min(H, y0 + O), min(W, x0 + O)
    rgb[ky0 - y0:ky1 - y0, kx0 - x0:kx1 - x0] = src[ky0:ky1, kx0:kx1]
    ngoai = np.ones((O, O), bool); ngoai[ky0 - y0:ky1 - y0, kx0 - x0:kx1 - x0] = _lb[ky0:ky1, kx0:kx1] != i + 1
    rgb[ngoai] = [3, 248, 13]  # phần của thẻ bên cạnh -> nền
    return rgb
for R in range(2):
    cells = []
    for C in range(3):
        rgb = o_the(R * 3 + C)
        u = unmix(rgb)
        lo = u[..., 3] < 0.6 * 255
        lb, n = ndimage.label(lo)
        mep = set(np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))) - {0}
        nen = np.isin(lb, list(mep))
        r_, g_, b_ = [rgb[..., i].astype(int) for i in range(3)]
        xanh = (g_ > 170) & (g_ > r_ + 70) & (g_ > b_ + 70)  # đốm nền xanh lọt vào trong (khe cờ, quầng lửa): cũng tách màu
        sat = ndimage.binary_dilation(nen | xanh, iterations=2)
        out = np.zeros_like(u)
        out[..., :3] = rgb; out[..., 3] = 255
        out[sat] = u[sat]
        cells.append(out)
    # ô chung cho 3 trạng thái: hộp bao chung
    m = np.zeros(cells[0].shape[:2], bool)
    for c in cells: m |= c[..., 3] > 20
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    # hệ số co theo thẻ thường (hộp đục > 128)
    m0 = cells[0][..., 3] > 128; ys0, xs0 = np.nonzero(m0); hc = ys0.max() + 1 - ys0.min()
    k = CAO[R] * N / hc
    tw, th = int(round((x1 - x0) * k)), int(round((y1 - y0) * k))
    # tâm mặt đồng: điểm màu đồng / vàng (đục) ở 45% dưới của thẻ thường, gần giữa
    c0 = cells[0]; r, g, b = [c0[..., i].astype(int) for i in range(3)]
    dong = (c0[..., 3] > 200) & (r > 150) & (g > 90) & (g < 200) & (b < 110) & (r - b > 90)
    dong[: int(ys0.min() + 0.45 * hc)] = False
    lb, n = ndimage.label(dong)
    sz = ndimage.sum(dong, lb, range(1, n + 1)); big = np.argmax(sz) + 1
    yy, xx = np.nonzero(lb == big); cy, cx = (yy.min() + yy.max()) / 2, (xx.min() + xx.max()) / 2
    neo[TEN[R][0]] = [round((cx - x0) / (x1 - x0), 3), round((cy - y0) / (y1 - y0), 3), round((yy.max() - yy.min()) / (y1 - y0), 3)]
    for C in range(3):
        a = thu_rgba(cells[C][y0:y1, x0:x1], tw, th)
        a[a[..., 3] < 10] = 0
        im = Image.fromarray(a, 'RGBA'); q = im.quantize(colors=128, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
        ma = TEN[R][C]
        t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ('Thẻ ải trùm · ' if R else 'Thẻ ải · ') + NHAN[C], 'doi_tuong': 'giao-dien',
             'anh': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'net': N}
        Image.open(io.BytesIO(buf.getvalue())).convert('RGBA').save(os.path.join(RA, ma + '.png'))
        ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
        json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print(ma, 'anh', (tw, th), 'game', (tw / N, th / N), 'byte', os.path.getsize(ra))
print('THE_NEO =', json.dumps(neo))
json.dump(neo, open(os.path.join(RA, 'the-neo.json'), 'w'))
