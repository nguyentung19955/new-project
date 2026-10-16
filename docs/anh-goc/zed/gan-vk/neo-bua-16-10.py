#!/usr/bin/env python3
"""NEO HAI TAY CHO HÀNG BÚA NỆN MỚI 16/10 (docs/review/ke-hoach-cai-thien/bua-moi-16-10/bao-cao.md).

Ảnh: docs/anh-goc/cu-ti-hang-moi-16-10/17-bua-nen-8k-v2.png (chủ game gen theo khung người đặc
     docs/khung-que-8-huong/nguoi-dac/bua-e.png, tay không cầm búa), cắt TAY (khung 2–3 / 3–4 / 5–6 dính hoặc sát nhau theo cột nền)
     bằng ../cat-diem-anh.py --cat-tay ../moi16/17-bua-nen-8k-cat-tay.json → ../moi16/17-bua-nen-8k-gif/bua/khung-NN.png.
Ghi vào neo.json mục "17-bua-nen-8k": mỗi khung [x, y, góc độ, sau, [x2, y2], {"co_dinh": 1}] — toạ độ ảnh khung đã cắt.
  - Ảnh vẽ HAI NẮM TAY CHỒNG NHAU thành một cụm (hầu hết khung chỉ thấy một nắm, nắm kia khuất sau) → đo TÂM CỤM NẮM TAY C
    (nam_chuoi.tam_nam, bắt đầu từ khối da nắm tay đoán theo ảnh), không đo được góc cán từ hai tay.
  - GÓC CÁN lấy từ khung người đặc (ve-bua.py: blade, quy ước toán y hướng lên) → góc game = −blade (0 = sang phải, dương = chúc xuống).
  - Hai tay đặt trên trục cán, cách nhau CACH điểm ảnh nguồn, đối xứng quanh C: tay TRÁI ở DƯỚI (phía đuôi cán) = điểm cầm chính
    (x, y — chuôi búa cam 0,12 đặt ở đây), tay PHẢI ở TRÊN (phía đầu búa) = tay2. Game vẽ nắm tay ôm cán (ảnh nam_tay) ở cả hai chỗ.
  - "co_dinh": dung-zed-game.py / nam_chuoi.py dùng đúng hai điểm và góc này (không kéo về khối da, không tính lại góc qua hai tay).
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 neo-bua-16-10.py  (rồi python3 ../dung-zed-game.py)
"""
import json, math, os, sys
from PIL import Image
DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import nam_chuoi as NC

THU = '17-bua-nen-8k'
THU_MUC = os.path.join(DAY, '..', 'moi16', THU + '-gif', 'bua')
# ve-bua.py BUA[k]['blade'] (độ, y hướng lên) — khung 1..8
BLADE = [150, 105, -15, -68, -64, -15, 35, 75]
# điểm đoán cụm nắm tay (ảnh khung đã cắt), xem lưới tay trong bao-cao.md
DOAN = [(30, 84), (82, 25), (241, 240), (216, 246), (209, 263), (209, 263), (177, 241), (167, 241)]
CACH = 44        # khoảng cách hai tay dọc cán, điểm ảnh nguồn (≈ 6 điểm ảnh ô 96 = 3 điểm ảnh game, ~2/3 bề ngang nắm tay)
# khung 8 thấy RÕ hai nắm tay cạnh nhau ((155, 247) và (182, 234)) → lấy điểm giữa, không kéo về một nắm
GIUA = {7: (168, 240)}
SAU = [0] * 8    # búa vẽ trước thân mọi khung (khung 1: búa chĩa ra sau-trên, ra khỏi người, không đè mặt — xem ảnh lưới)


def main():
    p = os.path.join(DAY, 'neo.json')
    neo = json.load(open(p, encoding='utf-8'))
    kh = []
    for i in range(8):
        im = Image.open(os.path.join(THU_MUC, 'khung-%02d.png' % (i + 1))).convert('RGBA')
        cx, cy = GIUA[i] if i in GIUA else NC.tam_nam(im, *DOAN[i])
        g = -BLADE[i]
        ux, uy = math.cos(math.radians(g)), math.sin(math.radians(g))
        h = CACH / 2
        trai = (round(cx - ux * h), round(cy - uy * h))
        phai = (round(cx + ux * h), round(cy + uy * h))
        kh.append([trai[0], trai[1], g, SAU[i], [phai[0], phai[1]], {'co_dinh': 1}])
        print('khung %d: tâm cụm nắm tay (%.0f, %.0f), góc %d°, tay trái (dưới) %s, tay phải (trên) %s' % (i + 1, cx, cy, g, trai, phai))
    neo[THU] = {'vk': 'vk-bua', 'dai': 0.75, 'cam': 0.12, 'khung': kh}
    json.dump(neo, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
