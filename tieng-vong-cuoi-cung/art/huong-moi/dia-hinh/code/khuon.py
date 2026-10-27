#!/usr/bin/env python3
"""KHUÔN (template) cho các mảnh địa hình CHƯA có ảnh gen (tư vấn 3, prompt A + B): cạnh đứng, mép đáy, góc lồi / lõm, ván một chiều.
Ra art/huong-moi/dia-hinh/khuon/:
  <ten>.png          khuôn từng mảnh, ĐÚNG cỡ ảnh 2x (px = logic × 2), nền TRẮNG
  khuon-tong-4x.png  tất cả khuôn phóng 4× logic trên một tấm 1536×1024 (gửi kèm prompt A/B để AI tô đúng vị trí), có chữ ghi tên + cỡ
  khuon.json         cỡ, vùng collider, phía lộ, cạnh nối của từng mảnh (cũng chép vào dia-hinh.json → "khuon")
Màu trong khuôn: XÁM = phần nằm trong collider (vẽ chất liệu đất / gỗ); HỒNG = dải được nhô ra ngoài collider (≤ 4 logic, chỉ rêu / mép);
ĐỎ = mặt đứng được (chỉ ván và mặt sàn); XANH đứt = cạnh NỐI với mảnh khác (phải liền, không viền); TRẮNG = để trống.
Chạy: python3 -B art/huong-moi/dia-hinh/code/khuon.py"""
import json, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DH = os.path.normpath(os.path.join(HERE, '..'))
KH = os.path.join(DH, 'khuon'); os.makedirs(KH, exist_ok=True)
NHO = 4
# tên: (rộng, cao logic, [collider x0,y0,x1,y1], phía lộ, cạnh nối, mặt đứng y (None), ghi chú)
P = {
    'canh-trai-dau':  (36, 64, [4, 0, 36, 64], 'trái', 'dưới; trên = nằm dưới đầu trái của mặt trên (mờ vào)', None, 'đầu trên của tường lộ bên trái'),
    'canh-trai-giua': (36, 64, [4, 0, 36, 64], 'trái', 'trên, dưới (lặp dọc)', None, 'lặp dọc'),
    'canh-trai-cuoi': (36, 64, [4, 0, 36, 64], 'trái', 'trên; dưới = gặp góc lồi dưới / sàn', None, 'đầu dưới'),
    'canh-phai-dau':  (36, 64, [0, 0, 32, 64], 'phải', 'dưới; trên = dưới đầu phải mặt trên', None, ''),
    'canh-phai-giua': (36, 64, [0, 0, 32, 64], 'phải', 'trên, dưới (lặp dọc)', None, ''),
    'canh-phai-cuoi': (36, 64, [0, 0, 32, 64], 'phải', 'trên', None, ''),
    'day-trai':       (68, 36, [4, 0, 68, 32], 'dưới + trái (góc lồi dưới trái)', 'phải, trên', None, 'mép đáy trần C / đáy bệ'),
    'day-giua':       (64, 36, [0, 0, 64, 32], 'dưới', 'trái, phải (lặp ngang), trên', None, 'lặp ngang'),
    'day-phai':       (68, 36, [0, 0, 64, 32], 'dưới + phải (góc lồi dưới phải)', 'trái, trên', None, ''),
    'goc-lom-san-trai': (64, 64, None, 'mặt tường (x 32, y 0–32) + mặt sàn (y 32, x 32–64)', 'trái, dưới, phải', 32, 'sàn gặp tường cao bên TRÁI'),
    'goc-lom-san-phai': (64, 64, None, 'mặt tường (x 32) + mặt sàn (y 32, x 0–32)', 'trái, dưới, phải', 32, 'sàn gặp tường cao bên PHẢI'),
    'goc-lom-tran-trai': (64, 64, None, 'mặt tường + đáy trần (y 32)', 'trái, trên, phải', None, 'trần gặp tường bên trái'),
    'goc-lom-tran-phai': (64, 64, None, 'mặt tường + đáy trần', 'trái, trên, phải', None, ''),
    'van-trai':       (36, 28, [4, 0, 36, 16], 'trái, dưới', 'phải', 0, 'ván một chiều: dày 16, giá đỡ chỉ chĩa xuống (tới 28)'),
    'van-giua':       (32, 28, [0, 0, 32, 16], 'dưới', 'trái, phải (lặp ngang)', 0, 'lặp ngang; ván B dài 4 ô = trái + giữa ×2 + phải'),
    'van-phai':       (36, 28, [0, 0, 32, 16], 'phải, dưới', 'trái', 0, ''),
}
# phía lộ / cạnh nối dạng mã (T trên, B dưới, L trái, R phải) – chữ ở trên chỉ để đọc
LO = {'canh-trai-dau': 'L', 'canh-trai-giua': 'L', 'canh-trai-cuoi': 'L', 'canh-phai-dau': 'R', 'canh-phai-giua': 'R', 'canh-phai-cuoi': 'R',
      'day-trai': 'LB', 'day-giua': 'B', 'day-phai': 'RB', 'van-trai': 'LB', 'van-giua': 'B', 'van-phai': 'RB'}
NOI = {'canh-trai-dau': 'B', 'canh-trai-giua': 'TB', 'canh-trai-cuoi': 'T', 'canh-phai-dau': 'B', 'canh-phai-giua': 'TB', 'canh-phai-cuoi': 'T',
       'day-trai': 'RT', 'day-giua': 'LRT', 'day-phai': 'LT', 'goc-lom-san-trai': 'LBR', 'goc-lom-san-phai': 'LBR', 'goc-lom-tran-trai': 'LTR',
       'goc-lom-tran-phai': 'LTR', 'van-trai': 'R', 'van-giua': 'LR', 'van-phai': 'L'}
XAM, HONG, DO, XANH = (205, 205, 205), (246, 210, 214), (225, 40, 40), (40, 110, 230)


def ve(ten, k):
    w, h, col, lo, noi, mat, _ = P[ten]
    im = Image.new('RGB', (w * k, h * k), (255, 255, 255)); d = ImageDraw.Draw(im)
    R = lambda a: [a[0] * k, a[1] * k, a[2] * k - 1, a[3] * k - 1]
    if ten.startswith('goc-lom'):
        phai = ten.endswith('phai'); san = '-san-' in ten
        tuong = [32, 0, 64, 64] if phai else [0, 0, 32, 64]
        if san: dat = [0, 32, 64, 64]; nho = [0, 32 - NHO, 32, 32] if phai else [32, 32 - NHO, 64, 32]
        else: dat = [0, 0, 64, 32]; nho = [0, 32, 32, 32 + NHO] if phai else [32, 32, 64, 32 + NHO]
        tn = [32 - NHO, 32 if san else 32, 32, 64] if phai else [32, 32, 32 + NHO, 64]
        tn = ([32 - NHO, 0, 32, 32] if phai else [32, 0, 32 + NHO, 32]) if san else ([32 - NHO, 32, 32, 64] if phai else [32, 32, 32 + NHO, 64])
        d.rectangle(R(nho), fill=HONG); d.rectangle(R(tn), fill=HONG)
        d.rectangle(R(tuong), fill=XAM); d.rectangle(R(dat), fill=XAM)
        if san: d.line([(0 if phai else 32 * k), 32 * k, (32 * k if phai else 64 * k), 32 * k], fill=DO, width=max(2, k // 2))
    else:
        cx0, cy0, cx1, cy1 = col
        lo = LO[ten]
        if 'L' in lo: d.rectangle(R([cx0 - NHO, cy0, cx0, cy1]), fill=HONG)
        if 'R' in lo: d.rectangle(R([cx1, cy0, cx1 + NHO, cy1]), fill=HONG)
        if 'B' in lo and not ten.startswith('van'): d.rectangle(R([cx0, cy1, cx1, cy1 + NHO]), fill=HONG)
        if ten.startswith('van'): d.rectangle(R([cx0 + 4, cy1, cx1 - 4, 28]), fill=(232, 232, 232))   # giá đỡ (tuỳ chọn) dưới ván
        d.rectangle(R(col), fill=XAM)
        if mat is not None: d.line([cx0 * k, 0, cx1 * k, 0], fill=DO, width=max(2, k // 2))
    # cạnh nối: viền xanh đứt
    def dut(x0, y0, x1, y1):
        n = max(1, int(max(abs(x1 - x0), abs(y1 - y0)) / (3 * k)))
        for i in range(0, n, 2):
            a, b = i / n, min(1, (i + 1) / n)
            d.line([x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b], fill=XANH, width=max(1, k // 2))
    W, H = w * k - 1, h * k - 1
    noi = NOI[ten]
    if 'T' in noi: dut(0, 0, W, 0)
    if 'B' in noi: dut(0, H, W, H)
    if 'L' in noi: dut(0, 0, 0, H)
    if 'R' in noi: dut(W, 0, W, H)
    return im


out = {}
for ten, (w, h, col, lo, noi, mat, gc) in P.items():
    ve(ten, 2).save(os.path.join(KH, ten + '.png'))
    out[ten] = {'tep_khuon': 'khuon/%s.png' % ten, 'co_logic': [w, h], 'co_anh_2x': [w * 2, h * 2], 'collider_logic': col, 'phia_lo': lo,
                'canh_noi': noi, 'ma_lo': LO.get(ten, ''), 'ma_noi': NOI[ten], 'mat_dung_y': mat, 'nho_toi_da_logic': NHO, 'ghi_chu': gc, 'tep_anh_gen': None}

# tấm tổng 1536×1024, mỗi khuôn phóng 4× logic
K = 4
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15); FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    F = FB = ImageFont.load_default()
tam = Image.new('RGB', (1536, 1024), (255, 255, 255)); d = ImageDraw.Draw(tam)
d.text((24, 16), 'KHUÔN ĐỊA HÌNH (×4 logic) – xám: trong collider · hồng: được nhô ≤4 · đỏ: mặt đứng · xanh đứt: cạnh nối liền', font=FB, fill=(30, 30, 30))
hang = [['canh-trai-dau', 'canh-trai-giua', 'canh-trai-cuoi', 'canh-phai-dau', 'canh-phai-giua', 'canh-phai-cuoi'],
        ['day-trai', 'day-giua', 'day-phai', 'van-trai', 'van-giua', 'van-phai'],
        ['goc-lom-san-trai', 'goc-lom-san-phai', 'goc-lom-tran-trai', 'goc-lom-tran-phai']]
y = 64
for r in hang:
    x = 24; hmax = 0
    for ten in r:
        im = ve(ten, K); tam.paste(im, (x, y + 22)); d.rectangle([x - 1, y + 21, x + im.width, y + 22 + im.height], outline=(150, 150, 150))
        d.text((x, y), '%s %d×%d' % (ten, P[ten][0], P[ten][1]), font=F, fill=(20, 20, 20))
        x += max(im.width, 150) + 40; hmax = max(hmax, im.height)
    y += hmax + 70
tam.save(os.path.join(KH, 'khuon-tong-4x.png'))
json.dump(out, open(os.path.join(KH, 'khuon.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
j = json.load(open(os.path.join(DH, 'dia-hinh.json'), encoding='utf-8')); j['khuon'] = out
json.dump(j, open(os.path.join(DH, 'dia-hinh.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'khuôn')
