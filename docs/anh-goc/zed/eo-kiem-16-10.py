#!/usr/bin/env python3
"""ĐIỂM EO CHO HÀNG KIẾM 1 MỚI 16/10 (docs/review/ke-hoach-cai-thien/kiem-moi-16-10/bao-cao.md).

Hàng kiem_1~16 (bộ ninja zed-moi) thay kiem_1 cũ trong game → khi CHẠY + CHÉM (ghép eo, js/zed_moi.js) phải dùng điểm eo đo trên
chính khung mới, không phải của kiem_1 cũ. Đo bằng đúng hàm do_eo / do_cat của cat-than.py trên tấm game/art/custom/zed-moi.sprite.json,
rồi CHÈN vào game/js/zed_eo_data.js mục bo.moi["kiem_1~16"] — các số cũ giữ nguyên từng chữ (chạy lại cả cat-than.py thì số hàng cũ
đổi nhẹ vì tấm đã nén 256 màu). Kiếm 3 không ghép eo (hàng cúi, như cũ).
Chạy (sau dung-zed-game.py, và SAU MỖI LẦN chạy lại cat-than.py):  python3 docs/anh-goc/zed/eo-kiem-16-10.py
Ghi thêm ảnh soát docs/review/ke-hoach-cai-thien/kiem-moi-16-10/ghep-eo-kiem-1.png (khung đòn | ghép với khung chạy, cách mới).
"""
import importlib.util, json, os
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(DAY, 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
HANG = ['kiem_1~16']
RA_XEM = os.path.join(CT.GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-moi-16-10')


def main():
    src = open(CT.RA_JS, encoding='utf-8').read()
    dau, sau = src.index('ZED_EO = ') + 9, src.rstrip().rindex(';')
    Z = json.loads(src[dau:sau])
    d, a = CT.doc_tam('zed-moi')
    cv = None
    for ten in HANG:
        dt = d['dong_tac'][ten]
        ds = []
        for i in range(dt['so']):
            f = CT.khung(a, dt['hang'], i)
            e = CT.do_eo(f, 'moi')
            if e is None:
                raise SystemExit('Không dò được đai: %s khung %d' % (ten, i + 1))
            ds.append(list(e[:2]) + CT.do_cat(f, e, 'moi'))
        Z['bo']['moi'][ten] = ds
        print(ten, ds, '| kiem_1 cũ:', Z['bo']['moi'].get(ten.split('~')[0]))
        # ảnh soát: khung đòn | ghép (chân = khung chạy) — cách mới zed-eo-sua
        dc, ec = d['dong_tac']['chay'], Z['bo']['moi']['chay']
        cv = Image.new('RGBA', (CT.O * dt['so'] * 2, CT.O), (58, 60, 72, 255))
        for i in range(dt['so']):
            j = (i * 3 + 1) % dc['so']
            fa, fr = CT.khung(a, dt['hang'], i), CT.khung(a, dc['hang'], j)
            cv.alpha_composite(Image.fromarray(fa), (CT.O * i * 2, 0))
            cv.alpha_composite(CT.ghep_moi(fa, ds[i], fr, ec[j]), (CT.O * (i * 2 + 1), 0))
    open(CT.RA_JS, 'w', encoding='utf-8', newline='\n').write(src[:dau] + json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + src[sau:])
    print('Đã chèn vào', os.path.relpath(CT.RA_JS, CT.GOC))
    if cv:
        os.makedirs(RA_XEM, exist_ok=True)
        p = os.path.join(RA_XEM, 'ghep-eo-kiem-1.png')
        cv.resize((cv.width * 3, cv.height * 3), Image.NEAREST).save(p, optimize=True)
        print('Đã ghi', os.path.relpath(p, CT.GOC))


if __name__ == '__main__':
    main()
