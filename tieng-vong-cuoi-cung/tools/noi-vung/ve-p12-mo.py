# -*- coding: utf-8 -*-
"""Nướng ảnh phòng trùm Vùng 1 P12 bản CÓ HẦM THÔNG ở tường phải (cột 38–39, hàng 10–12) – chỗ cổng rễ đan sang Vùng 2.
Dùng LẠI nguyên bộ nướng tools/vung-1/ve-phong.py (chỉ đọc, không sửa), cùng hạt giống 'P12' → đá giống hệt bản gốc, chỉ khác chỗ hầm.
Không sửa game/vung-1/phong/P12.json (lưới thật vẫn kín; game/vung-1/noi-vung-2.js mở ô khi rễ tháo).
Chạy:  python3 tools/noi-vung/ve-p12-mo.py   → art/vung-1/P12-mo-canh.png, P12-mo-truoc.png, P12-mo-canh.json
"""
import json, os, shutil, sys, tempfile
from PIL import Image

GOC = os.path.dirname(os.path.abspath(__file__))
DU_AN = os.path.normpath(os.path.join(GOC, '../..'))
V1 = os.path.join(DU_AN, 'tools/vung-1/ve-phong.py')
PHONG = os.path.join(DU_AN, 'game/vung-1/phong/')
ART = os.path.join(DU_AN, 'art/vung-1/')
X0, Y0 = 36, 7    # góc trên-trái (ô) vùng lấy từ bản có hầm


def main():
    tam = tempfile.mkdtemp(prefix='p12-mo-')
    try:
        ph, out = os.path.join(tam, 'phong'), os.path.join(tam, 'out')
        os.makedirs(ph); os.makedirs(out)
        d = json.load(open(PHONG + 'P12.json', encoding='utf-8'))
        L = [list(r) for r in d['luoi']]
        for r in (10, 11, 12):
            for c in (38, 39):
                L[r][c] = '.'
        d['luoi'] = [''.join(r) for r in L]
        d['cua'].append({'id': 'P12-dong-v2', 'cot': 39, 'hang': 10, 'cao': 3, 'huong': 'phai', 'toi': 'R201', 'toi_cua': 'R201-tay'})
        json.dump(d, open(os.path.join(ph, 'P12.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        src = open(V1, encoding='utf-8').read()
        for a, b in (("PHONG = os.path.join(DU_AN, 'game/vung-1/phong/')", 'PHONG = %r' % (ph + '/')),
                     ("OUT = os.path.join(DU_AN, 'art/vung-1/')", 'OUT = %r' % (out + '/'))):
            if a not in src:
                print('LỖI: tools/vung-1/ve-phong.py đã đổi, không khớp:', a); return 1
            src = src.replace(a, b)
        src = src.replace("if __name__ == '__main__':", "if False:")
        m = {'__name__': 've_p12_mo', '__file__': V1}
        exec(compile(src, V1, 'exec'), m)
        m['ve_phong']('P12')
        # đồ trang trí rải ngẫu nhiên lệch theo lưới → chỉ lấy GÓC PHẢI-DƯỚI (quanh hầm) của bản mới, phần còn lại giữ nguyên ảnh gốc
        x0, y0 = X0 * 16, Y0 * 16
        for f in ('canh.png', 'truoc.png'):
            goc = Image.open(ART + 'P12-' + f).convert('RGBA'); moi = Image.open(os.path.join(out, 'P12-' + f)).convert('RGBA')
            goc.paste(moi.crop((x0, y0, moi.width, moi.height)), (x0, y0))
            goc.save(ART + 'P12-mo-' + f, optimize=True)
            print('→', ART + 'P12-mo-' + f)
        shutil.copy(ART + 'P12-canh.json', ART + 'P12-mo-canh.json')
    finally:
        shutil.rmtree(tam, ignore_errors=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
