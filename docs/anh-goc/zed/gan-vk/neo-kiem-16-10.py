#!/usr/bin/env python3
"""NEO KIẾM CHO HÀNG KIẾM 1 / KIẾM 3 MỚI 16/10 (docs/review/ke-hoach-cai-thien/kiem-moi-16-10/bao-cao.md).

Ảnh: docs/anh-goc/cu-ti-hang-moi-16-10/08-kiem-1-5k-v2.png (5 khung) và 10-kiem-3-6k-v2.png (6 khung) — chủ game gen theo khung người
     đặc docs/khung-que-8-huong/nguoi-dac/kiem-1-e.png / kiem-3-e.png, tay phải nắm hờ (không cầm gì), cắt bằng ../cat-diem-anh.py ra
     ../moi16/08-kiem-1-5k-v2-gif/kiem1/ và ../moi16/10-kiem-3-6k-v2-gif/kiem3/.
Ghi vào neo.json mục "08-kiem-1-5k-v2" và "10-kiem-3-6k-v2", CÙNG ĐỊNH DẠNG hàng đòn cũ (vd "08-kiem-1-tp"):
  {"vk": "vk-kiem-moi", "khung": [[x, y, góc độ, sau], ...]} — toạ độ ảnh khung đã cắt (nắm tay PHẢI), góc 0 = lưỡi chỉ sang phải,
  dương = chúc xuống; sau 1 = kiếm vẽ SAU thân. Không ghi dai/cam → độ dài + điểm cầm chuôi như mọi hàng kiếm (DAI_CAP1).
GÓC: đo trên vạch đỏ (hướng lưỡi) của khung người đặc — tâm vạch đỏ (230,0,0) từng ô, hướng đi từ đầu gần cánh tay cam ra ngoài
     (hàm goc_vach). Vạch quá ngắn (< 200 điểm ảnh — kiếm 3 khung 4, mũi đâm thẳng) thì đọc tay: 0°.
NẮM TAY: điểm đoán bằng mắt trên ảnh khung (lưới 25 điểm ảnh), chỉnh bằng chinh_nam (tâm khối da quanh điểm đoán, bán kính 28)
     như mọi hàng; dung-zed-game.py còn chỉnh tiếp (tam_nam) cho biến thể nắm chuôi.
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 neo-kiem-16-10.py   (rồi python3 ../dung-zed-game.py)
"""
import json, math, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, '.')
from importlib import import_module
gt = import_module('ghep-thu-vk')

DAY = os.path.dirname(os.path.abspath(__file__))
NGUOI_DAC = os.path.join(DAY, '..', '..', '..', 'khung-que-8-huong', 'nguoi-dac')

# thư mục ảnh khung, ảnh người đặc, số khung, điểm đoán nắm tay PHẢI từng khung, sau (kiếm vẽ sau thân), góc đọc tay (None = đo vạch đỏ)
HANG = {
    '08-kiem-1-5k-v2': ('../moi16/08-kiem-1-5k-v2-gif/kiem1', 'kiem-1-e.png', 5,
                        [(125, 30), (336, 75), (376, 210), (306, 345), (319, 230)],
                        # khung 1: kiếm giơ ra sau đầu → vẽ sau thân (như hàng cũ khung 2)
                        [1, 0, 0, 0, 0], [None] * 5),
    '10-kiem-3-6k-v2': ('../moi16/10-kiem-3-6k-v2-gif/kiem3', 'kiem-3-e.png', 6,
                        [(25, 180), (86, 270), (303, 160), (336, 180), (218, 288), (220, 288)],
                        # khung 2: lưỡi chĩa xuống sau, nằm sau chân sau → vẽ sau thân
                        [0, 1, 0, 0, 0, 0], [None, None, None, 0, None, None]),
    # KIẾM 2 MỚI (phiên ve-tay-8-gop-giao-dien, 16/10): 09-kiem-2-5k-v2.png, 5 khung, chém hất lên, ★ chạm khung 3 (khung người đặc kiem-2-e.png,
    # ve-tu-the.py K2 blade -135 / -25 / 55 / 115 / 45 → góc game 135 / 25 / -55 / -115 / -45). Kiếm vẽ trước thân mọi khung.
    '09-kiem-2-5k-v2': ('../moi16/09-kiem-2-5k-v2-gif/kiem2', 'kiem-2-e.png', 5,
                        [(35, 300), (372, 330), (364, 185), (135, 60), (176, 325)],
                        [0, 0, 0, 0, 0], [None] * 5),
}


def goc_vach(anh, so):
    """Góc vạch đỏ từng ô của ảnh người đặc (độ, quy ước game). Trả [(góc, số điểm vạch)]."""
    a = np.array(Image.open(os.path.join(NGUOI_DAC, anh)).convert('RGB')).astype(int)
    W = a.shape[1] // so
    red = (a[..., 0] == 230) & (a[..., 1] == 0) & (a[..., 2] == 0)
    cam = (a[..., 0] == 255) & (a[..., 1] == 138) & (a[..., 2] == 0)
    ra = []
    for i in range(so):
        ys, xs = np.nonzero(red[:, i * W:(i + 1) * W])
        c = np.array([xs.mean(), ys.mean()])
        d = np.linalg.svd(np.stack([xs - c[0], ys - c[1]], 1), full_matrices=False)[2][0]
        oy, ox = np.nonzero(cam[:, i * W:(i + 1) * W])
        pr = (xs - c[0]) * d[0] + (ys - c[1]) * d[1]
        A, B = c + d * pr.min(), c + d * pr.max()
        if np.min((ox - A[0]) ** 2 + (oy - A[1]) ** 2) > np.min((ox - B[0]) ** 2 + (oy - B[1]) ** 2):
            A, B = B, A
        ra.append((math.degrees(math.atan2(B[1] - A[1], B[0] - A[0])), len(xs)))
    return ra


def main():
    p = os.path.join(DAY, 'neo.json')
    neo = json.load(open(p, encoding='utf-8'))
    for thu, (tm, anh, so, doan, sau, goc_tay) in HANG.items():
        gv = goc_vach(anh, so)
        kh = []
        for i in range(so):
            im = Image.open(os.path.join(DAY, tm, 'khung-%02d.png' % (i + 1))).convert('RGBA')
            x, y = gt.chinh_nam(im, *doan[i])
            g = goc_tay[i] if goc_tay[i] is not None else round(gv[i][0] / 5) * 5
            kh.append([round(x), round(y), g, sau[i]])
            print('%s khung %d: nắm (%d, %d) [đoán %s], vạch đỏ %.0f° (%d điểm) → góc %d°, sau %d' % (
                thu, i + 1, x, y, doan[i], gv[i][0], gv[i][1], g, sau[i]))
        neo[thu] = {'vk': 'vk-kiem-moi', 'khung': kh}
    json.dump(neo, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
