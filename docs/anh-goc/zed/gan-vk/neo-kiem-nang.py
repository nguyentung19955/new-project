#!/usr/bin/env python3
"""NEO KIẾM NẶNG (combo 3 nhát mới, 17/10 — docs/review/ke-hoach-cai-thien/kiem-nang/bao-cao.md).

Ảnh: docs/anh-goc/kiem-nang/kiem-nang-10k.png (chủ game gen theo khung người đặc docs/khung-que-8-huong/nguoi-dac/kiem-nang-e.png,
     tay trống), cắt bằng ../cat-diem-anh.py → ../moi16/28-kiem-nang-10k-gif/kiem/khung-NN.png (10 khung, ĐẠT).
Ghi vào neo.json mục "28-kiem-nang-10k": mỗi khung [x, y, góc độ, sau, [x2, y2] | None, {"co_dinh": 1}] — toạ độ ảnh khung đã cắt.
  - Góc kiếm lấy từ khung người đặc (ve-kiem-nang.py "blade": 0° = chĩa ra trước, DƯƠNG = CHĨA LÊN) → góc game = −blade
    (game: 0° = mũi sang phải, dương = chúc xuống). Khung lê đất / sát đất (1, 2, 3, 7): góc do dung-kiem-nang.py tính lại để mũi
    kiếm DÀI NHẤT (cấp 4) vừa chạm vạch đất, không xuyên đất (mục GOC_DAT ở đó) — số ở đây chỉ là góc người đặc.
  - Tay phải (tay cầm kiếm) = nắm tay phía sau (gần người xem) như mọi hàng kiếm cũ.
  - Khung MỘT TAY (1, 2: xách kiếm lê đất): điểm cầm = tâm nắm đấm (nam_chuoi.tam_nam).
  - Khung HAI TAY:
      * hai nắm tay thấy RIÊNG (8, 9): tay cầm chính = nắm GẦN LƯỠI (đốc chắn ngay mép nắm tay), tay thứ hai = nắm kia; góc kiếm =
        đường nối hai nắm (cán đi qua cả hai nắm), không theo góc người đặc.
      * hai nắm CHỒNG thành một cụm (3–7, 10): tâm cụm C; hai tay đặt trên trục kiếm cách nhau CACH điểm ảnh nguồn đối xứng quanh C
        (tay chính phía lưỡi, tay hai phía đốc) — như búa nện mới (neo-bua-16-10.py).
  - "co_dinh": dung-zed-game.py / nam_chuoi.py dùng đúng hai điểm và góc này.
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 neo-kiem-nang.py  (rồi python3 ../../kiem-nang/dung-kiem-nang.py)
"""
import json, math, os, sys
from PIL import Image
DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import nam_chuoi as NC

THU = '28-kiem-nang-10k'
THU_MUC = os.path.join(DAY, '..', 'moi16', THU + '-gif', 'kiem')
# ve-kiem-nang.py K[k]['blade'] (độ, dương = lên) — khung 1..10
BLADE = [212, 205, -25, 70, 140, -15, -60, 180, 0, 165]
# (điểm đoán tâm nắm tay chính, điểm đoán tay hai | 'cum' | None) — ảnh khung đã cắt, đọc trên lưới ×3
DOAN = [((40, 190), None), ((41, 190), None), ((160, 195), 'cum'), ((180, 35), 'cum'), ((122, 22), 'cum'),
        ((232, 130), 'cum'), ((188, 208), 'cum'), ((40, 138), (68, 138)), ((225, 130), (195, 130)), ((180, 105), 'cum')]
CACH = 14   # hai tay chồng nhau trên chuôi kiếm (ngắn hơn cán búa): 14 điểm ảnh nguồn ≈ 2,7 điểm ảnh ô 96
# kiếm vẽ SAU thân: 5 (giơ trên đầu, lưỡi chĩa ra sau-lên qua tóc), 10 (vòng qua vai, lưỡi ngang mặt) — không che mặt
SAU = [0, 0, 0, 0, 1, 0, 0, 0, 0, 1]


def tinh(goc_dat=None):
    """Danh sách khung neo. goc_dat: {khung (đếm từ 0): góc game} ghi đè (khung lê / sát đất)."""
    kh = []
    for i in range(10):
        im = Image.open(os.path.join(THU_MUC, 'khung-%02d.png' % (i + 1))).convert('RGBA')
        (x0, y0), t = DOAN[i]
        g = -BLADE[i]
        g = ((g + 180) % 360) - 180
        if goc_dat and i in goc_dat:
            g = goc_dat[i]
        if t is None:
            cx, cy = NC.tam_nam(im, x0, y0, 18)
            kh.append([round(cx, 1), round(cy, 1), g, SAU[i], None, {'co_dinh': 1}])
        elif t == 'cum':
            cx, cy = NC.tam_nam(im, x0, y0, 22)
            ux, uy = math.cos(math.radians(g)), math.sin(math.radians(g))
            h = CACH / 2
            kh.append([round(cx + ux * h, 1), round(cy + uy * h, 1), g, SAU[i], [round(cx - ux * h, 1), round(cy - uy * h, 1)], {'co_dinh': 1}])
        else:
            ax, ay = NC.tam_nam(im, x0, y0, 14)
            bx, by = NC.tam_nam(im, t[0], t[1], 14)
            g = round(math.degrees(math.atan2(ay - by, ax - bx)), 1)   # từ tay hai (phía đốc) → tay chính (phía lưỡi)
            kh.append([round(ax, 1), round(ay, 1), g, SAU[i], [round(bx, 1), round(by, 1)], {'co_dinh': 1}])
    return kh


def ghi(kh):
    p = os.path.join(DAY, 'neo.json')
    neo = json.load(open(p, encoding='utf-8'))
    neo[THU] = {'vk': 'vk-kiem-moi', 'khung': kh}
    json.dump(neo, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    kh = tinh()
    for i, k in enumerate(kh):
        print('khung %2d: %s' % (i + 1, k))
    ghi(kh)
