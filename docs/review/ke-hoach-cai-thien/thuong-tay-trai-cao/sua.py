#!/usr/bin/env python3
"""THƯƠNG: NÂNG TAY TRÁI (17/10/2026, chủ game 01:39 "ở phần thương tôi muốn cầm cao ở tay trái lên 1 chút để trông nó rộng ra").

Ghi game/js/thuong_cao_data.js (G.THUONG_CAO_DATA, bộ ninja zed-moi) — không thêm ảnh: game tự dựng khung đã nâng tay từ tấm zed-moi:
  - cot: phép dời cột của nang.py ([x, y0, y1, dời lên], ô 96) — game áp cho khung thân và cho hàng nắm tay thân (hang_tay).
  - {khoá dong_tac: {so, khung: {i: {cu: [x, y, góc] neo đang dùng, neo: neo mới, cot}}}}
    neo mới: tay phải (điểm cầm) GIỮ NGUYÊN, tay thứ hai dời lên dy, góc = đường nối hai tay → cán thẳng qua cả hai nắm tay.
js/zed_moi.js (bienThe → thuongCao) chỉ dùng khi neo đang dùng (sau cam-vk-chuan) khớp "cu" — tấm dựng lại thì tự về như cũ.
Tắt: ?thuongcao=0.

Mức nâng dy (điểm ảnh ô 96 = ½ điểm game):
  - đứng 4, chạy hai tay 4 (hai tay gần nhau: 4 đã chếch thêm ~19°), đi 5, giữ thương 6;
  - hàng đòn: theo khoảng cách hai tay sao cho cán chếch thêm ~13°, kẹp 4..6 (= 2..3 điểm game);
  - GIỮ BẢN CŨ (dy 0): khung đâm trúng của thương 1 / 3 (khung 3–4) và thương 2 (khung 3–4) — mũi + hướng đâm giữ đúng chỗ đâm;
    quét khung 6 (hai tay chỉ cách 3 điểm game: nâng 2 điểm game làm cán dựng 30°, hai nắm tay chồng nhau — xấu).
Chạy (từ gốc repo): python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/sua.py
"""
import base64, io, json, math, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '../../../..'))
sys.path.insert(0, DAY)
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/cam-vk-chuan'))
import nang as NG  # noqa: E402
import do_cam as DC  # noqa: E402
import soat as SO  # noqa: E402

VZ = DC.VZ
RA = os.path.join(ROOT, 'game/js/thuong_cao_data.js')
# hàng game (khoá dong_tac gốc) cầm thương HAI TAY. Lộn / trúng đòn không cầm; xốc + Phi Thương (khung 1–2) cầm MỘT tay phải → không có tay trái.
HANG = ['dung~16_thuong', 'di_thuong', 'chay2tay_thuong', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'thuong_giu']
DY_HANG = {'dung~16_thuong': 4, 'di_thuong': 5, 'chay2tay_thuong': 4, 'thuong_giu': 6}
GIU_CU = {('thuong_1', 2): 'khung đâm trúng', ('thuong_1', 3): 'khung đâm trúng', ('thuong_3', 2): 'khung đâm trúng',
          ('thuong_3', 3): 'khung đâm trúng', ('thuong_2', 2): 'khung hất trúng', ('thuong_2', 3): 'khung hất trúng',
          ('thuong_quet', 5): 'hai tay quá gần (3 điểm game): cán dựng 30°, hai nắm tay chồng nhau'}


def dy_cua(k, i, n):
    if (k, i) in GIU_CU:
        return 0
    if k in DY_HANG:
        return DY_HANG[k]
    d = math.hypot(n[4][0] - n[0], n[4][1] - n[1])
    return int(min(6, max(4, round(d * math.tan(math.radians(13))))))


def tai():
    T, V = VZ.tai('zed-moi'), VZ.tai('zed-vk')
    return T, V, SO.lam_sua(T, SO.doc_bang())


def neo_dung(T, SUA, k, i):
    """Neo đang dùng trong game (biến thể nắm chuôi + bảng cam-vk-chuan)."""
    r = SUA(k, i, 0)
    if r and r[0] is not None:
        return r[0]
    return T['dong_tac'][k]['nam']['neo'][i]


def o96(img, hang, i):
    return np.array(img.crop((i * 96, hang * 96, i * 96 + 96, hang * 96 + 96)))


def tinh(T, SUA):
    """[(khoá, khung, dy, neo cũ, neo mới | None, thân mới, nắm tay mới, thông tin)]"""
    ra = []
    for k in HANG:
        da = T['dong_tac'][k]
        for i in range(da['so']):
            n = neo_dung(T, SUA, k, i)
            if not n or len(n) < 5 or not n[4]:
                continue
            dy = dy_cua(k, i, n)
            if not dy:
                ra.append((k, i, 0, n, None, None, None, {'ly_do': GIU_CU.get((k, i), '')}))
                continue
            a = o96(T['_img'], da['hang'], i)
            F = NG.tam_nam(a, n[4]) or tuple(n[4])
            r = NG.nang(a, F, dy, xmin=int(n[0]) + 3)
            if r is None:
                ra.append((k, i, 0, n, None, None, None, {'ly_do': 'không dò được cánh tay'}))
                continue
            than, info = r
            ht = NG.doi_lop(o96(T['_img'], da['nam']['hang_tay'], i), info['_cot'], info['xa'], info['xb'], dy)
            t2 = [round(n[4][0], 2), round(n[4][1] - dy, 2)]
            g = round(math.degrees(math.atan2(t2[1] - n[1], t2[0] - n[0])), 1)
            ra.append((k, i, dy, n, [n[0], n[1], g, n[3], t2], than, ht, info))
    return ra


def cot_doi(info, dy):
    """Bảng dời cột cho game: phẳng [x, y0, y1, s, ...] — cột x, đoạn y0..y1 (ô 96) dời lên s điểm ảnh (như NG.doi_lop)."""
    ra = []
    for x, (y0, y1) in sorted(info['_cot'].items()):
        w = 1.0 if x >= info['xb'] else max(0.0, (x - info['xa'] + 1) / (info['xb'] - info['xa'] + 1))
        ra += [int(x), int(y0), int(y1), int(round(dy * w))]
    return ra


def main():
    T, V, SUA = tai()
    kq = tinh(T, SUA)
    bo = {}
    for (k, i, dy, n, n2, than, ht, info) in kq:
        if not n2:
            continue
        bo.setdefault(k, {'so': T['dong_tac'][k]['so'], 'khung': {}})['khung'][str(i)] = {
            'cu': [n[0], n[1], n[2]], 'neo': n2, 'cot': cot_doi(info, dy)}
    data = {'phien': 1, 'ghi_chu': 'thuong-tay-trai-cao 17/10: nâng nắm tay trái khi cầm thương hai tay (sua.py); khoá = khoá dong_tac gốc; '
            'cu = neo đang dùng (sau cam-vk-chuan) để nhận ra tấm đã dựng lại; cot = [x, y0, y1, dời lên] trên ô 96 của hàng thân và hàng nắm tay',
            'bo': {'zed-moi': bo}}
    js = ('// THƯƠNG: NÂNG TAY TRÁI (17/10/2026, docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/bao-cao.md) — TỆP DỰNG TỰ ĐỘNG bằng\n'
          '// docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/sua.py, đừng sửa tay. js/zed_moi.js (thuongCao): khi Cu Tí cầm thương hai tay,\n'
          '// dựng lại khung thân với cẳng tay + nắm tay trái dời lên (dời đúng điểm ảnh sẵn có theo cột, không vẽ mới), tay thứ hai dời lên,\n'
          '// cán đi thẳng qua tay phải (giữ nguyên) và tay trái mới. Chỉ HÌNH. Tắt: ?thuongcao=0 (G.THUONG_CAO, js/data.js).\n'
          'window.G = window.G || {};\nG.THUONG_CAO_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(RA, 'w', encoding='utf-8') as f:
        f.write(js)
    print('Ghi %s (%.1f KB)' % (os.path.relpath(RA, ROOT), os.path.getsize(RA) / 1024))
    bang = []
    for (k, i, dy, n, n2, than, ht, info) in kq:
        bang.append({'hang': k, 'khung': i + 1, 'dy': dy, 'goc_cu': n[2], 'goc_moi': n2[2] if n2 else n[2],
                     'tay2_cu': n[4], 'tay2_moi': n2[4] if n2 else n[4], 'ly_do': info.get('ly_do', '')})
        print('  %-16s khung %2d  dy %d (%.1f điểm game)  góc %6.1f → %6.1f  %s' % (k, i + 1, dy, dy / 2, n[2], n2[2] if n2 else n[2], info.get('ly_do', '')))
    json.dump(bang, open(os.path.join(DAY, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
