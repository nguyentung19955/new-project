"""Ráp Lam v5 – đọc lam-v5.json + PNG (như runtime game), thêm attachment duỗi/gập.

Dùng lại nguyên Rig của rap4 (FK, sắp lớp, visible…). Khác duy nhất ở bước vẽ:
  với mỗi chi mà pose bật attachment (pose['attachment'][chi] = góc gập), thay ảnh mảnh cha bằng ảnh
  attachment có goc_gap đúng/gần nhất, ma trận M_cha · T(−ox, −oy); bỏ vẽ mảnh con (cẳng).
  Găng/ủng/dao vẽ như cũ với ma trận FK (góc cục bộ cẳng = dau_goc_con × goc_gap – pose v5 đặt đúng như vậy).
"""
import os
import numpy as np
from PIL import Image
import rap4
from rap4 import T_, app, render, render_ids, put  # noqa: F401 (xuất lại cho tiện dùng)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))


class Rig5(rap4.Rig):
    def __init__(s, json_path=None, manh_dir=None):
        json_path = json_path or os.path.join(ROOT, 'lam-v5.json')
        manh_dir = manh_dir or os.path.join(ROOT, 'manh')
        super().__init__(json_path, manh_dir)
        base = manh_dir or os.path.dirname(os.path.abspath(json_path))
        s.att = s.meta.get('attachment', {}).get('chi', {})
        s.att_img = {}
        for chi, d in s.att.items():
            for it in d['ds']:
                s.att_img[it['anh']] = Image.open(os.path.join(base, it['anh'])).convert('RGBA')

    def chon(s, chi, gap):
        ds = s.att[chi]['ds']
        return min(ds, key=lambda it: abs(it['goc_gap'] - gap))

    def layers(s, pose=None, only=None, slot_override=None):
        pose = pose or {}
        L = super().layers(pose, only=None, slot_override=slot_override)
        use = pose.get('attachment', {})
        if not use:
            return [x for x in L if only is None or x[0] in only]
        repl, hide = {}, set()
        for chi, gap in use.items():
            d = s.att[chi]; it = s.chon(chi, gap)
            repl[d['cha']] = it; hide.update(d['an_manh'])
        out = []
        for n, img, M in L:
            if n in hide:
                continue
            if n in repl:
                it = repl[n]
                img = s.att_img[it['anh']]; M = M @ T_(-it['offset'][0], -it['offset'][1])
            if only is None or n in only:
                out.append((n, img, M))
        return out


def load_default():
    return Rig5()
