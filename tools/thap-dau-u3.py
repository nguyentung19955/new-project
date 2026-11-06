#!/usr/bin/env python3
"""TURRET MERGE — ĐẦU ỤNG VẼ LẠI ĐƠN LẺ u3 (ChatGPT, 1 đầu / ảnh) → thap/assets.
Nguồn (giữ nguyên): docs/demo-hop-tuong/thap-art/raw_u3_<id>.png (1 đầu giữa ảnh, nền magenta).
Cách cắt y hệt tools/thap-dau-u2.py (khoá magenta tách trộn → không viền hồng; tâm xoay = tâm vành bệ tròn khớp RANSAC;
cỡ theo VÀNH BỆ chung VANH = trung vị của bộ đầu hiện tại → đầu ngồi khít bệ như mọi ụ khác; xuất 3× cỡ hiển thị lớn nhất).
Bản cũ cất 1 lần: <id>_nong_v2old.png, nho/<id>_v2old.png.
Chạy: python3 tools/thap-dau-u3.py saochep [nayda ...]   (không đối số: mọi raw_u3_*.png chưa lắp)
"""
import glob, importlib.util, json, os, shutil, sys
import numpy as np
from PIL import Image

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sp = importlib.util.spec_from_file_location('u2', os.path.join(GOC, 'tools', 'thap-dau-u2.py'))
U2 = importlib.util.module_from_spec(sp); sp.loader.exec_module(U2)
V2 = U2.V2; A = U2.A; JS = U2.JS; ART = U2.ART
CUT = os.path.join(ART, 'u3', 'cut')
TAM_MIN = 0.68   # tầm với nhỏ nhất (K·far): bách phân vị 10 của bộ đầu hiện tại (trung vị ≈ 0.75)


def vanh(HK, bo_qua):
    """VANH = trung vị (K · 2 · bán kính vành / cạnh ảnh) đo lại trên các đầu đang dùng (không tính ụ đang thay)"""
    v = []
    for id_, K in HK.items():
        if id_ in bo_qua or id_ in U2.G_IDS: continue
        p = os.path.join(A, id_ + '_nong.png')
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGBA'); m = np.asarray(im)[..., 3] > 110
        _, r = U2.tam_be(m)
        if r: v.append(K * 2 * r / im.size[0])
    return float(np.median(v))


if __name__ == '__main__':
    ids = sys.argv[1:] or [os.path.basename(p)[7:-4] for p in sorted(glob.glob(os.path.join(ART, 'raw_u3_*.png')))]
    os.makedirs(CUT, exist_ok=True)
    at = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read(); mt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read()
    HK = V2.js_obj(at, 'HEAD_K'); AM = V2.js_obj(mt, 'ART_META')
    VANH = vanh(HK, set(ids)); print('VANH', round(VANH, 3))
    for id_ in ids:
        raw = os.path.join(ART, 'raw_u3_%s.png' % id_)
        ob = U2.cat_tam(raw, (1, 1), 1)[0]
        if ob is None: print('THIEU', id_); continue
        im, q, r = ob; im.save(os.path.join(CUT, id_ + '_nong.png'))
        K0, far, _, _ = U2.do_K(im)
        K = round(float(min(max(VANH / (2 * q), TAM_MIN / far), 0.98 / far)), 3) if q else K0   # đầu dạng ĐĨA (vành bao cả hình): phóng tới tầm với ≥ TAM_MIN như các đầu có nòng
        dst = os.path.join(A, id_ + '_nong.png')
        if os.path.exists(dst) and not os.path.exists(dst[:-4] + '_v2old.png'): shutil.copy2(dst, dst[:-4] + '_v2old.png')
        ic = os.path.join(A, 'nho', id_ + '.png')
        if os.path.exists(ic) and not os.path.exists(ic[:-4] + '_v2old.png'): shutil.copy2(ic, ic[:-4] + '_v2old.png')
        n = U2.co_xuat(K, im.size[0]); U2.thu(im, n).save(dst); V2.LM.lam(dst)
        print('%-10s q %.3f K %.3f (cũ %s) far %.3f n %d' % (id_, q or 0, K, HK.get(id_), far, n))
        HK[id_] = K; AM.setdefault(id_, {})['s'] = round(K / 0.8, 3); AM[id_]['tip'] = min(0.98, V2.mui(U2.mat(Image.open(dst))))
        V2.icon(id_, K, far)
    open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(V2.js_set(at, 'HEAD_K', HK))
    open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(V2.js_set(mt, 'ART_META', AM))
