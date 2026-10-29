#!/usr/bin/env python3
"""Ghép ảnh nguồn CHÉM 1 SÁU HÌNH – bản C2 (để SO với C1 thu11; game: ?chem1=ghep) – PH15 mục 2 + PH16.

    python3 ghep_chem1.py    → art/huong-moi/nguon/lam-tu-the/thu12-chem1-6o-ghep.png (6 ô một hàng, nền trắng) rồi dung_thu3.py chem1_ghep

Ô 1, 3, 4, 5 = thu8-chem1-6o-o2-loi.png (ô 1, 3, 4, 5 – giữ nguyên điểm ảnh, cùng ô 362 × 724)
Ô 2          = thu10-chem1-o2.png tư thế TRÁI (tay trước bụng, lưỡi trễ xuống-trái – bản sửa theo PH16 mục 5)
Ô 6          = thu9-chem1-o2-o6.png tư thế PHẢI (thủ – PH16: dùng thử thay ô 6)
Hai ảnh thu9 / thu10 vẽ to hơn ~2,4 lần → thu về CÙNG CỠ MŨ với thu8 (cỡ mũ = căn(rộng hàng mắt × cao trên mắt), như dung_thu3 – KHÔNG theo khung bao có dao),
đặt đáy ủng lên cùng đường đáy ủng thu8; vị trí ngang không quan trọng (dung_thu3 neo theo giữa hai ủng). Sau đó dung_thu3 dựng sheet với MỘT tỉ lệ."""
import os, sys
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from tach import tach_anh, cat_o, do_tu_the
from dung_sheet import ung
from dung_thu3 import co_mu

NG = os.path.normpath(os.path.join(HERE, '..', '..', 'nguon', 'lam-tu-the'))
RA = os.path.join(NG, 'thu12-chem1-6o-ghep.png')


def lay(f, cot, o):
    r = tach_anh(os.path.join(NG, f)); tt = cat_o(r, cot, 1); x0, y0, x1, y1, m = tt[o - 1]
    im = r.copy(); im[~m] = 0; d = do_tu_the(r, m); u = ung(r, m, y1)
    return im[y0:y1, x0:x1], d, (x0, y0, x1, y1), u


def main():
    goc = [lay('thu8-chem1-6o-o2-loi.png', 6, i) for i in (1, 3, 4, 5)]
    cm8 = float(np.median([co_mu(g[1])[0] for g in goc if co_mu(g[1])]))
    day8 = int(np.median([max(t[2] for t in g[3]) - g[2][1] + g[2][1] for g in goc if g[3]]))   # đáy ủng (px ảnh thu8)
    them = {2: lay('thu10-chem1-o2.png', 2, 1), 6: lay('thu9-chem1-o2-o6.png', 2, 2)}
    H8, cw = 724, 640   # ô rộng 640 (thu8 gốc 362: vạt áo / lưỡi tràn sang ô bên) – mỗi hình đặt GIỮA HAI ỦNG vào giữa ô
    out = np.zeros((H8, cw * 6, 4), np.uint8)
    ghi = []
    def dan(i, sm, ux, Y):
        h, w = sm.shape[:2]; X = int(round((i - 1) * cw + cw / 2 - ux))
        assert X >= (i - 1) * cw and X + w <= i * cw and Y >= 0 and Y + h <= H8, ('ô %d tràn ô' % i, X, w, Y, h)
        reg = out[Y:Y + h, X:X + w]; out[Y:Y + h, X:X + w] = np.where(sm[..., 3:4] > 0, sm, reg)
    giua_ung = lambda u, x0: ((u[0][0] + u[-1][1]) / 2 - x0) if u else None
    for i, g in zip((1, 3, 4, 5), goc):
        im, d, (x0, y0, x1, y1), u = g; ux = giua_ung(u, x0)
        dan(i, im, ux if ux is not None else im.shape[1] / 2, y0)
    for i, g in them.items():
        im, d, (x0, y0, x1, y1), u = g; k = cm8 / co_mu(d)[0]
        a = im.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
        w, h = int(round(im.shape[1] * k)), int(round(im.shape[0] * k)); sm = cv2.resize(pm, (w, h), interpolation=cv2.INTER_AREA)
        al = sm[..., 3:4]; rgb = np.where(al > 1e-4, sm[..., :3] / np.maximum(al, 1e-4), 0); sm = (np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8)
        day = (max(t[2] for t in u) - y0) * k if u else h; ux = giua_ung(u, x0)
        dan(i, sm, ux * k if ux is not None else w / 2, int(round(day8 - day)))
        ghi.append('ô %d: ×%.3f (cỡ mũ %.1f → %.1f px)' % (i, k, co_mu(d)[0], cm8))
    a = out[..., 3:4].astype(np.float32) / 255; rgb = out[..., :3] * a + 255 * (1 - a)
    Image.fromarray(rgb.round().astype(np.uint8)).save(RA, optimize=True)
    print('->', RA, '·', '; '.join(ghi), '· cỡ mũ thu8 %.1f, đáy ủng y %d' % (cm8, day8))


if __name__ == '__main__':
    main()
