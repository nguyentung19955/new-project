#!/usr/bin/env python3
"""ĐIỂM EO CHO HÀNG CHẠY MỚI 16/10 (docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/bao-cao.md).

Hàng chay~16 (bộ ninja zed-moi) thay hàng chạy cũ trong game → CHẠY + CHÉM (ghép eo, js/zed_moi.js: chân = khung chạy, thân trên =
khung đòn) phải dùng điểm eo đo trên chính khung chạy mới. Đo bằng đúng do_eo / do_cat của cat-than.py trên tấm
game/art/custom/zed-moi.sprite.json rồi CHÈN vào game/js/zed_eo_data.js mục bo.moi["chay~16"] (số cũ giữ nguyên từng chữ, như
eo-kiem-16-10.py). Chạy (sau dung-zed-game.py, và SAU MỖI LẦN chạy lại cat-than.py):  python3 docs/anh-goc/zed/eo-chay-16-10.py
Ảnh soát: docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1/ghep-eo-chay.png — hàng trên: kiếm 1 (mới) ghép chân chạy CŨ; hàng dưới: ghép
chân chạy MỚI (12 khung chạy, thân trên lần lượt 5 khung kiếm 1)."""
import importlib.util, json, os
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(DAY, 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
TEN = 'chay~16'
RA_XEM = os.path.join(CT.GOC, 'docs', 'review', 'ke-hoach-cai-thien', 've-tay-8-dot-1')


def main():
    src = open(CT.RA_JS, encoding='utf-8').read()
    dau, sau = src.index('ZED_EO = ') + 9, src.rstrip().rindex(';')
    Z = json.loads(src[dau:sau])
    d, a = CT.doc_tam('zed-moi')
    dt = d['dong_tac'][TEN]
    ds = []
    for i in range(dt['so']):
        f = CT.khung(a, dt['hang'], i)
        e = CT.do_eo(f, 'moi')
        if e is None:
            raise SystemExit('Không dò được đai: %s khung %d' % (TEN, i + 1))
        ds.append(list(e[:2]) + CT.do_cat(f, e, 'moi'))
    Z['bo']['moi'][TEN] = ds
    print(TEN, ds)
    print('chay cũ:', Z['bo']['moi']['chay'])
    open(CT.RA_JS, 'w', encoding='utf-8', newline='\n').write(src[:dau] + json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + src[sau:])
    print('Đã chèn vào', os.path.relpath(CT.RA_JS, CT.GOC))
    # ảnh soát
    ka = 'kiem_1~16' if 'kiem_1~16' in d['dong_tac'] else 'kiem_1'
    da_, ea = d['dong_tac'][ka], Z['bo']['moi'].get(ka) or Z['bo']['moi']['kiem_1']
    cv = Image.new('RGBA', (CT.O * 12, CT.O * 2), (58, 60, 72, 255))
    for r, tc in enumerate(('chay', TEN)):
        dc, ec = d['dong_tac'][tc], Z['bo']['moi'][tc]
        for j in range(dc['so']):
            i = j % da_['so']
            fa, fr = CT.khung(a, da_['hang'], i), CT.khung(a, dc['hang'], j)
            cv.alpha_composite(CT.ghep_moi(fa, ea[i], fr, ec[j]), (CT.O * j, CT.O * r))
    os.makedirs(RA_XEM, exist_ok=True)
    p = os.path.join(RA_XEM, 'ghep-eo-chay.png')
    cv.resize((cv.width * 2, cv.height * 2), Image.NEAREST).save(p, optimize=True)
    print('Đã ghi', os.path.relpath(p, CT.GOC))


if __name__ == '__main__':
    main()
