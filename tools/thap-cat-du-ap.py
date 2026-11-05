#!/usr/bin/env python3
"""TURRET MERGE — áp kết quả tools/thap-cat-du.py (docs/demo-hop-tuong/tuvan/growcut/cat-du.json) vào số đo cỡ:
  khung ảnh nới e lần quanh tâm → hệ số cỡ ×e, mũi nòng ÷e (cỡ hiển thị + điểm bắn không đổi).
  - ảnh dạng <id>_nong_sN: STAGE_K_CHO / STAGE_TIP_CHO (artscale.js)
  - đầu thường <id>_nong: HEAD_K (artscale.js), ART_META.s / .tip (meta.js) + dựng lại icon thẻ assets/nho/<id>.png
Chạy 1 lần sau mỗi lượt cắt (json chỉ ghi mục đã cắt lượt đó: chạy lại thap-cat-du.py trên ảnh gốc trước khi chạy lại script này).
"""
import os, re, json, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(GOC, 'thap/js'); A = os.path.join(GOC, 'thap/assets')
spec = importlib.util.spec_from_file_location('dv2', os.path.join(GOC, 'tools', 'thap-dau-v2.py'))
DV2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(DV2)


def doc(txt, ten):
    m = re.search(r'window\.' + ten + r' = (\{.*?\});', txt); return json.loads(m.group(1)), m.group(0)


def main():
    kq = json.load(open(os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/growcut/cat-du.json')))
    at = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read(); mt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read()
    SK, sk0 = doc(at, 'STAGE_K_CHO'); ST, st0 = doc(at, 'STAGE_TIP_CHO'); HK, hk0 = doc(at, 'HEAD_K'); AM, am0 = doc(mt, 'ART_META')
    for ten, v in kq.items():
        if not v.get('ghi'): continue
        e = v.get('e', 1.0); id_ = ten.split('_nong')[0]
        if '_nong_s' in ten:
            i = int(ten[-1]) - 1
            if abs(e - 1) > 1e-4 and id_ in SK: SK[id_][i] = round(SK[id_][i] * e, 3); ST[id_][i] = round(ST[id_][i] / e, 3); print(ten, 'STAGE ×', e)
        else:
            if abs(e - 1) > 1e-4:
                HK[id_] = round(HK[id_] * e, 3)
                if id_ in AM: AM[id_]['s'] = round(AM[id_]['s'] * e, 3); AM[id_]['tip'] = round(AM[id_]['tip'] / e, 3)
                print(ten, 'HEAD ×', e)
            a = np.asarray(Image.open(os.path.join(A, id_ + '_nong.png')).convert('RGBA'))[..., 3] > 110; W = a.shape[0]
            ys, xs = np.nonzero(a); far = float(np.sqrt((xs + .5 - W / 2) ** 2 + (ys + .5 - W / 2) ** 2).max() / (W / 2))
            DV2.icon(id_, HK[id_], far); print(ten, 'icon nho/')
    at = at.replace(sk0, 'window.STAGE_K_CHO = ' + json.dumps(SK) + ';').replace(st0, 'window.STAGE_TIP_CHO = ' + json.dumps(ST) + ';').replace(hk0, 'window.HEAD_K = ' + json.dumps(HK) + ';')
    mt = mt.replace(am0, 'window.ART_META = ' + json.dumps(AM) + ';')
    open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(at); open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(mt)


if __name__ == '__main__': main()
