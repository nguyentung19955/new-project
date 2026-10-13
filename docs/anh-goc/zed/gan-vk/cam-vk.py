#!/usr/bin/env python3
"""ZED CẦM VŨ KHÍ LÚC ĐỨNG / ĐI / CHẠY (13/10/2026, docs/review/ke-hoach-cai-thien/zed-cam-vk/YEU-CAU.md, chủ dự án chốt "2a").

Ghi vào neo.json các mục "<thư mục hàng>#<loại vũ khí>" cho 01-dung, 02-di, 03-chay-v4 × kiem / thuong / bua / phitieu,
cùng định dạng [x, y, goc, sau, [tay2]] (toạ độ ảnh khung đã cắt của bộ ninja). dung-zed-game.py đọc các mục này thành các hàng
"<khoá>_<loại>" (vd. dung_kiem, chay_bua) dùng chung ảnh thân của hàng đứng/đi/chạy, có neo + hàng nắm tay riêng.

Điểm nắm đo bằng mắt trên ảnh soát (tim-tay.py + ảnh phóng to từng khung), ghi dưới đây:
  P = nắm tay PHẢI (tay phía sau thân, cùng tay cầm vũ khí lúc chém → không nhảy tay khi vào đòn)
  T = nắm tay TRÁI (tay phía trước)
Khung chạy nào tay phải khuất sau thân (ẩn = 1) thì ước lượng chỗ nắm (chọn chỗ không có da trong bán kính 28 để chinh_nam
không kéo điểm cầm sang tay kia) và vũ khí vẽ SAU người.
Chạy lại:  cd docs/anh-goc/zed/gan-vk && python3 cam-vk.py  (rồi python3 ../dung-zed-game.py)
"""
import json, math, sys
from importlib import import_module
from PIL import Image
sys.path.insert(0, '.')
gt = import_module('ghep-thu-vk')

HANG = {
    '01-dung': ('../moi/01-dung-gif/dung', [
        # (P, T, ẩn)
        ((61, 317), (244, 299), 0), ((61, 317), (244, 299), 0), ((61, 317), (245, 298), 0), ((61, 320), (244, 302), 0),
        ((61, 317), (243, 299), 0), ((61, 317), (245, 302), 0), ((60, 317), (243, 299), 0), ((61, 316), (244, 298), 0)]),
    '02-di': ('../moi/02-di-gif/02-di', [
        ((43, 284), (223, 266), 0), ((69, 290), (189, 275), 0), ((55, 293), (164, 261), 0), ((52, 283), (220, 259), 0),
        ((42, 284), (223, 266), 0), ((71, 290), (189, 279), 0), ((53, 293), (165, 265), 0), ((51, 284), (222, 260), 0)]),
    '03-chay-v4': ('../moi/03-chay-v4-gif/03-chay-v4', [
        ((55, 176), (156, 140), 0), ((102, 166), (143, 140), 0), ((40, 178), (128, 140), 1), ((55, 176), (138, 141), 1),
        ((55, 177), (156, 142), 0), ((58, 178), (167, 148), 1), ((53, 178), (161, 145), 1), ((48, 177), (158, 143), 0),
        ((39, 178), (129, 144), 1), ((55, 176), (146, 143), 1), ((70, 188), (163, 145), 0), ((79, 177), (180, 147), 0)]),
}
KIEM_GOC = -15      # kiếm thế thủ: lưỡi chếch lên-ra trước, ló ra trước ngực (dốc hơn thì lưỡi mọc ra sau đầu/che mặt)
PHI_GOC = -20       # phi tiêu trong nắm tay
LAC = 0.12          # đung đưa: nắm tay ra trước (x lớn) → lưỡi chúc xuống một chút (độ / điểm ảnh nguồn), kẹp ±8°
VK = {'kiem': 'vk-kiem-moi', 'thuong': 'vk-thuong', 'bua': 'vk-bua', 'phitieu': 'vk-phi-tieu'}
LECH = 12           # thương/búa: góc hai tay lệch trung vị cả hàng quá LECH độ (tay trái không với tới cán hợp lý) → chỉ cầm tay phải
TRUOC = 0          # 13/10 13:42 chủ dự án: vũ khí nằm RA TRƯỚC người khi đứng/đi/chạy (0 = vẽ trước thân; 1 = sau thân như bản đầu)
DAI = {'thuong': (1.3, 0.2), 'bua': (0.75, 0.12), 'phitieu': (0.13, 0.5)}   # như hàng đòn; phi tiêu: một chiếc nhỏ, cầm giữa


def main():
    neo = json.load(open('neo.json', encoding='utf-8'))
    for thu, (thu_muc, ds) in HANG.items():
        ims = [Image.open('%s/khung-%02d.png' % (thu_muc, i + 1)).convert('RGBA') for i in range(len(ds))]
        assert Image.open('%s/khung-%02d.png' % (thu_muc, len(ds))) and len(ims) == len(ds)
        xs = [p[0] for p, t, a in ds]; xtb = sum(xs) / len(xs)
        for loai, vk in VK.items():
            kh = []
            g2 = []
            for im, (p, t, an) in zip(ims, ds):
                px, py = gt.chinh_nam(im, *p); tx, ty = gt.chinh_nam(im, *t)
                g2.append(math.degrees(math.atan2(ty - py, tx - px)))
            gtv = sorted(g2)[len(g2) // 2]
            for im, (p, t, an), g in zip(ims, ds, g2):
                px, py = gt.chinh_nam(im, *p); tx, ty = gt.chinh_nam(im, *t)   # như game: neo đi qua chinh_nam
                lac = max(-8, min(8, (px - xtb) * LAC))
                if loai == 'kiem':
                    kh.append([p[0], p[1], round(KIEM_GOC + lac), TRUOC])
                elif loai == 'phitieu':
                    kh.append([p[0], p[1], round(PHI_GOC + lac), TRUOC])
                elif abs(g - gtv) <= LECH:  # thương, búa: hai tay — cán đi qua nắm tay phải rồi nắm tay trái
                    kh.append([p[0], p[1], round(g, 1), TRUOC, [t[0], t[1]]])
                else:  # tay trái không với tới cán: chỉ tay phải, cán chúi xuống-ra sau theo góc trung vị của hàng
                    kh.append([p[0], p[1], round(gtv, 1), TRUOC])
            e = {'vk': vk, 'khung': kh}
            if loai in DAI:
                e['dai'], e['cam'] = DAI[loai]
            neo[thu + '#' + loai] = e
            print(thu + '#' + loai, [k[2] for k in kh])
    json.dump(neo, open('neo.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
