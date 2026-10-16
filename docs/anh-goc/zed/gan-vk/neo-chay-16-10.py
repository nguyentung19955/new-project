#!/usr/bin/env python3
"""NEO VŨ KHÍ CHO HÀNG CHẠY MỚI 16/10 (docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/bao-cao.md).

Ảnh: docs/anh-goc/cu-ti-hang-moi-16-10/03-chay-12k-v2.png (12 khung sát nhau), cắt ra ../moi16/03-chay-12k-v2-gif/chay/khung-NN.png
(khung 2 đã sửa mảng trắng trên bắp tay: ../moi16/sua-chay-k2.py).
Ghi vào neo.json các mục "03-chay-12k-v2#<loại>" CÙNG ĐỊNH DẠNG neo-hang-16-10.py / cam-vk.py:
  [x, y, góc độ, sau, [tay2]] — toạ độ ảnh khung đã cắt; góc 0 = lưỡi chỉ sang phải, dương = chúc xuống; sau 0 = vẽ trước thân.
  P = nắm tay PHẢI (tay quấn băng, gần camera, cùng tay cầm vũ khí lúc đứng / chém): ở SAU hông mọi khung trừ khung 8 (vung ra trước bụng).
  T = nắm tay TRÁI (trước ngực); khung 8 tay trái khuất → không có tay2 (thương / búa cầm một tay khung đó).
Điểm nắm = chinh_nam (tâm khối da quanh điểm đoán, bán kính 28) từng khung. Kiếm / phi tiêu: góc như hàng đứng (KIEM_GOC, PHI_GOC)
+ đung đưa theo x nắm tay (LAC). Thương / búa: cán qua hai nắm tay P → T.
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 neo-chay-16-10.py  (rồi python3 ../dung-zed-game.py)
"""
import json, math, sys
from importlib import import_module
from PIL import Image
sys.path.insert(0, '.')
gt = import_module('ghep-thu-vk')
cv = import_module('cam-vk')

THU = '03-chay-12k-v2'
THU_MUC = '../moi16/03-chay-12k-v2-gif/chay'
# điểm đoán từng khung (đo bằng khối da trên ảnh đã cắt): P = nắm tay phải, T = nắm tay trái (None: khuất)
P0 = [(20, 189), (34, 205), (14, 193), (23, 190), (34, 189), (40, 189), (30, 204), (117, 178), (15, 196), (25, 189), (33, 192), (38, 186)]
T0 = [(147, 164), (141, 163), (131, 163), (143, 134), (168, 144), (172, 143), (148, 162), None, (126, 162), (153, 135), (167, 140), (172, 142)]


def main():
    neo = json.load(open('neo.json', encoding='utf-8'))
    ims = [Image.open('%s/khung-%02d.png' % (THU_MUC, i + 1)).convert('RGBA') for i in range(len(P0))]
    ds = []
    for im, p0, t0 in zip(ims, P0, T0):
        p = tuple(round(v) for v in gt.chinh_nam(im, *p0))
        t = tuple(round(v) for v in gt.chinh_nam(im, *t0)) if t0 else None
        ds.append((p, t))
    xtb = sum(p[0] for p, t in ds if p[0] < 80) / sum(1 for p, t in ds if p[0] < 80)
    for loai, vk in cv.VK.items():
        kh = []
        for p, t in ds:
            lac = max(-8, min(8, (p[0] - xtb) * cv.LAC))
            if loai == 'kiem':
                kh.append([p[0], p[1], round(cv.KIEM_GOC + lac), cv.TRUOC])
            elif loai == 'phitieu':
                kh.append([p[0], p[1], round(cv.PHI_GOC + lac), cv.TRUOC])
            elif t:
                kh.append([p[0], p[1], round(math.degrees(math.atan2(t[1] - p[1], t[0] - p[0])), 1), cv.TRUOC, [t[0], t[1]]])
            else:
                kh.append([p[0], p[1], round(cv.KIEM_GOC + lac), cv.TRUOC])
        e = {'vk': vk, 'khung': kh}
        if loai in cv.DAI:
            e['dai'], e['cam'] = cv.DAI[loai]
        neo[THU + '#' + loai] = e
        print(THU + '#' + loai, [k[:3] for k in kh])
    json.dump(neo, open('neo.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
