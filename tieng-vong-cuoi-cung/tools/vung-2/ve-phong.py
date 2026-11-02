# -*- coding: utf-8 -*-
"""Nướng ảnh cảnh phòng Vùng 2 "Rotting Roots" – dùng LẠI nguyên bộ nướng Vùng 1 (tools/vung-1/ve-phong.py, chỉ đọc, KHÔNG sửa)
với chất liệu ChatGPT của Vùng 2 thay cho chất liệu phòng demo.

Chạy:  python3 tools/vung-2/ve-phong.py            (mọi phòng R2xx / RS2xx)
       python3 tools/vung-2/ve-phong.py R204 R206

Cần ảnh (phiên gen ảnh, docs/yeu-cau-anh/vung/):
  007 → art/vung-2/chat-lieu/t_fill.png, t_top.png, t_ceil.png        (bắt buộc – thiếu thì DỪNG, không nướng tạm)
  013 → art/vung-2/chat-lieu/go-trai.png, go-giua.png, go-phai.png, thang-dinh.png, thang-than.png, thang-day.png
Ghi:   art/vung-2/<ID>-canh.png / -truoc.png / -manh.png / -canh.json (cùng định dạng Vùng 1).
Ô động của Vùng 2 (R Q P gỗ mục, X gai, B ao, L chốt rễ, C cổng) KHÔNG nướng vào ảnh – game vẽ bằng ảnh ChatGPT riêng
(yêu cầu 008–018) đè lên lúc chơi, theo trạng thái trong game/vung-2/dat-muc.js.
"""
import glob, json, os, shutil, sys, tempfile
from PIL import Image

GOC = os.path.dirname(os.path.abspath(__file__))
DU_AN = os.path.normpath(os.path.join(GOC, '../..'))
V1 = os.path.join(DU_AN, 'tools/vung-1/ve-phong.py')
DEMO1 = os.path.join(DU_AN, 'tools/phong-demo/')
CL = os.path.join(DU_AN, 'art/vung-2/chat-lieu/')
PHONG = os.path.join(DU_AN, 'game/vung-2/phong/')
OUT = os.path.join(DU_AN, 'art/vung-2/')
BAT_BUOC = ['t_fill', 't_top', 't_ceil']
DONG = set('RQPXBLC')
# màu mặt đất theo bảng màu ChatGPT Vùng 2 (root shadow → wet wood → exposed wood → rot ochre), sau → trước
MD_MAU_V2 = '[[52, 37, 43], [72, 51, 47], [103, 70, 58], [128, 104, 61]]'


def thieu():
    return [n for n in BAT_BUOC if not os.path.exists(CL + n + '.png')]


def ghep_be(tam):
    """bệ sàn mỏng kiểu plat_4 (đầu 22 | giữa 108 | đuôi) từ go-trai / go-giua / go-phai"""
    p = [CL + n + '.png' for n in ('go-trai', 'go-giua', 'go-phai')]
    if not all(os.path.exists(x) for x in p):
        return False
    goc = Image.open(DEMO1 + 'plat_4.png')
    h = goc.height
    tr, gi, ph = [Image.open(x).convert('RGBA') for x in p]
    sc = lambda im, w: im.resize((w, h), Image.NEAREST)
    duoi_w = goc.width - 130
    im = Image.new('RGBA', goc.size)
    im.alpha_composite(sc(tr, 22), (0, 0))
    x = 22
    while x < 130:
        w = min(gi.width * h // max(1, gi.height), 130 - x) or 1
        im.alpha_composite(sc(gi, w), (x, 0)); x += w
    im.alpha_composite(sc(ph, duoi_w), (130, 0))
    im.save(os.path.join(tam, 'plat_4.png'))
    return True


def main():
    t = thieu()
    if t:
        print('CHƯA CÓ ẢNH chất liệu Vùng 2 (yêu cầu 007):', ', '.join(CL + n + '.png' for n in t))
        print('→ không nướng (luật: chưa có ảnh thì chưa bật, không vẽ tạm).')
        return 0
    tam = tempfile.mkdtemp(prefix='ve-phong-v2-')
    try:
        demo = os.path.join(tam, 'demo'); os.makedirs(demo)
        for f in glob.glob(DEMO1 + '*.png'):           # đồ trang trí chung thế giới (fallback)
            shutil.copy(f, demo)
        for n in BAT_BUOC:
            shutil.copy(CL + n + '.png', os.path.join(demo, n + '.png'))
        if not ghep_be(demo):
            print('! chưa có go-trai/giua/phai (yêu cầu 013) – sàn mỏng tạm dùng bệ rễ Vùng 1')
        for v1, v2 in (('v_top', 'thang-dinh'), ('v_mid1', 'thang-than'), ('v_mid2', 'thang-than'), ('v_bot', 'thang-day')):
            if os.path.exists(CL + v2 + '.png'):
                shutil.copy(CL + v2 + '.png', os.path.join(demo, v1 + '.png'))
        ph = os.path.join(tam, 'phong'); os.makedirs(ph)
        for f in glob.glob(PHONG + '*.json'):
            d = json.load(open(f, encoding='utf-8'))
            d['luoi'] = [''.join('.' if ch in DONG else ch for ch in r) for r in d['luoi']]
            json.dump(d, open(os.path.join(ph, os.path.basename(f)), 'w', encoding='utf-8'), ensure_ascii=False)
        src = open(V1, encoding='utf-8').read()
        thay = [("DEMO = os.path.join(DU_AN, 'tools/phong-demo/')", 'DEMO = %r' % (demo + '/')),
                ("PHONG = os.path.join(DU_AN, 'game/vung-1/phong/')", 'PHONG = %r' % (ph + '/')),
                ("OUT = os.path.join(DU_AN, 'art/vung-1/')", 'OUT = %r' % OUT),
                ("MD_MAU = np.array([[52, 33, 32], [78, 51, 46], [104, 70, 60], [124, 86, 72]], float)", 'MD_MAU = np.array(%s, float)' % MD_MAU_V2)]
        for a, b in thay:
            if a not in src:
                print('LỖI: tools/vung-1/ve-phong.py đã đổi, không khớp dòng:', a); return 1
            src = src.replace(a, b)
        src = src.replace("if __name__ == '__main__':", "if False:")
        m = {'__name__': 've_phong_v2', '__file__': V1}
        exec(compile(src, V1, 'exec'), m)
        os.makedirs(OUT, exist_ok=True)
        ds = sys.argv[1:] or [os.path.basename(f)[:-5] for f in sorted(glob.glob(PHONG + '*.json'))]
        for pid in ds:
            m['ve_phong'](pid)
    finally:
        shutil.rmtree(tam, ignore_errors=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
