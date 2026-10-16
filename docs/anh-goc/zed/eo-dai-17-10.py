#!/usr/bin/env python3
"""ĐIỂM GHÉP Ở ĐAI (17/10, docs/review/ke-hoach-cai-thien/chan-di-danh/bao-cao.md).

Vừa đi / chạy vừa ra đòn (js/zed_moi.js, G.CHAN_DON): thân trên khung ĐÒN (tới đáy đai) đặt lên chân khung ĐI / CHẠY (từ đáy đai),
khớp TÂM ĐAI (không còn cắt giữa đùi + kéo giãn vùng nối như zed-eo-sua). Script này:
  1. đo hàng `di` (đi bộ) cả 4 bộ + `chay2tay` (chạy cầm thương / búa, bộ có hàng này) bằng do_eo / do_cat của cat-than.py → bo.<bộ>.di (trước đây đi + đánh mượn chân hàng chạy);
  2. thêm vào MỖI khung đã có [y, x, c, l, r] ba số: [5] = tâm đai (cột nguồn, có thể .5), [6] = bề rộng đai — mép trái / phải các
     điểm MÀU ĐAI ở 4 hàng y−3..y. Đai bị tay che (rộng < 3 hoặc > 22) → dùng trung vị hàng đó;
     hàng chân (chay, chay~16, di, chay2tay) dùng MỘT tâm chung cả hàng (trung vị) — thân không lắc theo đuôi đai bay;
     [7] = đáy đai đo lại (≥ 4 điểm màu đai / hàng; [0] cũ có khung bắt nhầm mắt đỏ — giữ [0] cho ?chandon=0).
Các số cũ [0..4] giữ nguyên từng chữ (game cũ và ?chandon=0 vẫn đọc như trước). Chạy lại được nhiều lần.
Chạy:  python3 docs/anh-goc/zed/eo-dai-17-10.py
"""
import importlib.util, json, os
import numpy as np

DAY = os.path.dirname(os.path.abspath(__file__))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(DAY, 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
RONG_MIN, RONG_MAX = 3, 22
HANG_CHAN = ('chay', 'chay~16', 'di', 'chay2tay')


def day_dai(f, bo, y_cu):
    """Đáy đai đo lại: hàng đầu tiên (từ trên, trong vùng do_eo dò) có ≥ 4 điểm MÀU ĐAI, hàng sau ≥ 2 — do_eo cũ chỉ cần ≥ 2 nên ở khung
    cúi thấp (kiếm 2 mới khung 1–2) bắt nhầm MẮT ĐỎ (y 58–59, đai thật ở 72–73)."""
    al = f[..., 3] > 100
    h, s, v = CT.hsv(f)
    m = al & CT.MAU_DAI[bo](h, s, v) & ~CT.da(f)
    z0 = CT.CHAN_Y - CT.VUNG_TREN.get(bo, 34)
    dem = m.sum(1)
    for r in range(z0, CT.CHAN_Y - 13):
        if dem[r] >= 4 and dem[r + 1] >= 2:
            return r + CT.DAY_DAI - 1
    return y_cu


def tam_dai(f, y, bo):
    """(tâm, bề rộng) ĐAI: mép trái / phải các điểm MÀU ĐAI ở 4 hàng y−3..y (đai nhìn nghiêng chỉ vài điểm ảnh mỗi hàng nên lấy cả dải)."""
    al = f[..., 3] > 100
    h, s, v = CT.hsv(f)
    xs = np.nonzero((al & CT.MAU_DAI[bo](h, s, v))[y - 3:y + 1].any(0))[0]
    if not len(xs):
        return 0.0, 0
    return (xs.min() + xs.max()) / 2, int(xs.max() - xs.min() + 1)


def main():
    src = open(CT.RA_JS, encoding='utf-8').read()
    dau, sau = src.index('ZED_EO = ') + 9, src.rstrip().rindex(';')
    Z = json.loads(src[dau:sau])
    for bo, ma in CT.BO.items():
        d, a = CT.doc_tam(ma)
        B = Z['bo'][bo]
        for hb in ('di', 'chay2tay'):  # chân đi bộ; chân chạy hai tay (thương / búa đang chạy dùng hàng này)
            dt = d['dong_tac'].get(hb)
            if dt and hb not in B:
                ds = []
                for i in range(dt['so']):
                    e = CT.do_eo(CT.khung(a, dt['hang'], i), bo)
                    ds.append(list(e[:2]) + CT.do_cat(CT.khung(a, dt['hang'], i), e, bo) if e is not None else list(Z['bo']['moi'][hb][i][:5]))
                B[hb] = ds
        for ten, ds in B.items():
            a_ = d['dong_tac'].get(ten)
            if not a_:
                continue
            yy = [day_dai(CT.khung(a, a_['hang'], i), bo, ds[i][0]) for i in range(len(ds))]
            for i in range(len(ds)):  # chỉ sửa chỗ bắt nhầm MẮT: đáy đai cũ cách đỉnh đầu < 26 hàng và đo lại thấp hơn ≥ 10 hàng
                dinh = int(np.nonzero((CT.khung(a, a_['hang'], i)[..., 3] > 100).any(1))[0].min())
                if yy[i] - ds[i][0] >= 10 and ds[i][0] - dinh < 26:
                    print('  đáy đai đo lại', bo, ten, 'khung', i + 1, ds[i][0], '→', yy[i])
                else:
                    yy[i] = ds[i][0]
            do = [tam_dai(CT.khung(a, a_['hang'], i), yy[i], bo) for i in range(len(ds))]
            tot = [c for c, w in do if RONG_MIN <= w <= RONG_MAX]
            med = float(np.median(tot)) if tot else float(np.median([c for c, w in do]))
            for i, (c, w) in enumerate(do):
                if not (RONG_MIN <= w <= RONG_MAX) or ten in HANG_CHAN:
                    c = med  # hàng chân (đi / chạy): thân gần như đứng yên theo chiều ngang → một số chung cả hàng, khỏi lắc theo đuôi đai bay
                ds[i] = ds[i][:5] + [round(c * 2) / 2, int(w), int(yy[i])]
            print(bo, ten, [x[5] for x in ds])
    Z['dai'] = 1
    open(CT.RA_JS, 'w', encoding='utf-8', newline='\n').write(src[:dau] + json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + src[sau:])
    print('Đã ghi', os.path.relpath(CT.RA_JS, CT.GOC))


if __name__ == '__main__':
    main()
