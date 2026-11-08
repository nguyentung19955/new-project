#!/usr/bin/env python3
"""TURRET MERGE — cắt 4 DẠNG Mạch Máu (Blood Circuit, mauhut) + đạn máu — 09/11 "ụ Tấn công theo Máu".

Nguồn (ChatGPT, lưới 2×2 nền magenta, docs/demo-hop-tuong/thap-art/):
  raw_mod_mauhut_f<2..4>.png  ô 1 lắp sẵn · ô 2 BỆ · ô 3 ĐẦU (chĩa LÊN) · ô 4 huy hiệu giọt máu của dạng (y như raw_mod_<id>, dạng 1 = raw_mod_mauhut)
  raw_fx_mauhut_dan.png       ô 1–3 đạn máu nhỏ / vừa / lớn (bay sang PHẢI) · ô 4 nova máu tròn
Ra (thap/assets/):
  mauhut_f<n>_de / _vien / _nong / _phu.png  — cắt y như tools/thap-cat-umod.py (cùng hàm, cùng mật độ)
  fx_mauhut_b1..b3.png (đạn, ngang 256 px), fx_mauhut_nova.png (vuông 384 px)
Ghi thap/js/artscale.js: window.MAUHUT_DANG = { f<n>: { K (đầu / cạnh ô), DE (bệ × bệ chung), tip, PHU } }
Chạy: python3 tools/thap-cat-mauhut.py
"""
import os, json, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)
OUT = U.OUT


def dang(n):
    i = 'mauhut_f%d' % n
    r = U.mot(i)
    nho = os.path.join(OUT, 'nho', i + '.png')
    if os.path.exists(nho): os.remove(nho)  # icon thẻ chỉ dùng dạng 1 (nho/mauhut)
    print(i, 'K', r['HEAD_K'], 'DE', r['DE_RIENG'], 'PHU', r['PHU_K'], 'thu', r['thu'], 'khop', r['khop_be'], r['khop_dau'])
    return {'K': r['HEAD_K'], 'DE': r['DE_RIENG'], 'tip': r['tip'], 'PHU': r['PHU_K']}


def dan():
    a8 = np.asarray(Image.open(os.path.join(U.RAW, 'raw_fx_mauhut_dan.png')).convert('RGB'))
    O = U.o_luoi(a8)
    for k, (ten, px) in enumerate((('fx_mauhut_b1', 256), ('fx_mauhut_b2', 256), ('fx_mauhut_b3', 256), ('fx_mauhut_nova', 384))):
        m = U.tach(O[k])[0]; c = U.khoa(O[k].astype(np.float64) / 255, m)
        x0, y0, x1, y1 = U.bbox(c[..., 3] > 0)
        if ten == 'fx_mauhut_nova':  # vuông, tâm = tâm khung bao
            h = max(x1 - x0, y1 - y0) / 2 + 3
            im = U.thu(U.dat_giua(c, (x0 + x1) / 2, (y0 + y1) / 2, h), px)
        else:  # đạn: khung chữ nhật sát hình (ngang), tâm ảnh = tâm khung bao
            c2 = c[max(0, y0 - 3):y1 + 3, max(0, x0 - 3):x1 + 3]
            W, H = c2.shape[1], c2.shape[0]
            q = Image.fromarray((np.clip(c2, 0, 1) * 255).astype(np.uint8), 'RGBA')
            pm = q.convert('RGBa').resize((px, max(1, round(px * H / W))), Image.LANCZOS).convert('RGBA')
            im = np.asarray(pm).astype(np.float64) / 255
        U.luu(im, ten)
        print(ten, 'ok')


def main():
    meta = {'f%d' % n: dang(n) for n in (2, 3, 4)}
    dan()
    p = os.path.join(U.JS, 'artscale.js'); t = open(p, encoding='utf-8').read()
    t = U.js_set(t, 'MAUHUT_DANG', meta, '// claude/demo-hop-tuong 09/11 (tools/thap-cat-mauhut.py): 3 dạng mới Mạch Máu theo mốc Máu — đầu mauhut_f<n>_nong (cỡ ô × K), bệ _de (× DE), huy hiệu _phu')
    open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
