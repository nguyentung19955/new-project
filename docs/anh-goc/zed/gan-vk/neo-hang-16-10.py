#!/usr/bin/env python3
"""NEO VŨ KHÍ CHO HÀNG ĐỨNG MỚI 16/10 (docs/review/ke-hoach-cai-thien/hang-moi-16-10/bao-cao.md).

Ảnh: docs/anh-goc/cu-ti-hang-moi-16-10/01-dung-8k.png (chủ game gen, tay không cầm vũ khí, nắm hờ tay phải), cắt bằng
     ../cat-diem-anh.py ra ../moi16/01-dung-8k-gif/dung/khung-NN.png.
Ghi vào neo.json các mục "01-dung-8k#<loại>" CÙNG ĐỊNH DẠNG cam-vk.py (hàng đứng cũ 01-dung#<loại>):
  [x, y, góc độ, sau, [tay2]]  — toạ độ ảnh khung đã cắt; góc 0 = lưỡi chỉ sang phải, dương = chúc xuống; sau 0 = vũ khí vẽ trước thân.
  P = nắm tay PHẢI (tay phía sau thân trong ảnh, gần camera — cùng tay cầm vũ khí lúc chém), T = nắm tay TRÁI (tay phía trước).
Điểm nắm đo bằng chinh_nam (tâm khối da quanh điểm đoán, bán kính 28) trên từng khung; soát mắt bằng ảnh blob (bao-cao.md mục 3).
Kiếm/phi tiêu: góc cố định như hàng cũ (KIEM_GOC, PHI_GOC của cam-vk.py) + đung đưa nhẹ theo x nắm tay.
Thương/búa: cán đi qua hai nắm tay (P → T), tay2 = T (như hàng cũ).
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 neo-hang-16-10.py  (rồi python3 ../dung-zed-game.py)
"""
import json, math, sys
from importlib import import_module
from PIL import Image
sys.path.insert(0, '.')
gt = import_module('ghep-thu-vk')
cv = import_module('cam-vk')

HANG = {
    '01-dung-8k': ('../moi16/01-dung-8k-gif/dung', 8, (57, 325), (185, 288)),  # (thư mục, số khung, đoán P, đoán T)
}


def main():
    neo = json.load(open('neo.json', encoding='utf-8'))
    for thu, (thu_muc, so, P0, T0) in HANG.items():
        ims = [Image.open('%s/khung-%02d.png' % (thu_muc, i + 1)).convert('RGBA') for i in range(so)]
        ds = [(tuple(round(v) for v in gt.chinh_nam(im, *P0)), tuple(round(v) for v in gt.chinh_nam(im, *T0))) for im in ims]
        xtb = sum(p[0] for p, t in ds) / so
        for loai, vk in cv.VK.items():
            kh = []
            for p, t in ds:
                lac = max(-8, min(8, (p[0] - xtb) * cv.LAC))
                if loai == 'kiem':
                    kh.append([p[0], p[1], round(cv.KIEM_GOC + lac), cv.TRUOC])
                elif loai == 'phitieu':
                    kh.append([p[0], p[1], round(cv.PHI_GOC + lac), cv.TRUOC])
                else:
                    kh.append([p[0], p[1], round(math.degrees(math.atan2(t[1] - p[1], t[0] - p[0])), 1), cv.TRUOC, [t[0], t[1]]])
            e = {'vk': vk, 'khung': kh}
            if loai in cv.DAI:
                e['dai'], e['cam'] = cv.DAI[loai]
            neo[thu + '#' + loai] = e
            print(thu + '#' + loai, [k[:3] for k in kh])
    json.dump(neo, open('neo.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
