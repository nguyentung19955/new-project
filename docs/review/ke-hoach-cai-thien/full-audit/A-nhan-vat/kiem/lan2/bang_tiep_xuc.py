#!/usr/bin/env python3
"""Bảng tiếp xúc phóng to một tấm sprite: mỗi hàng động tác một dòng, viền ô, vạch đất (goc y) đỏ, vạch tâm (goc x) xanh.
Chạy: python3 bang_tiep_xuc.py <ma> <tệp ra.png> [phóng] [hàng1,hàng2,...]"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from do_tinh import nap

CUSTOM = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../game/art/custom')


def ve(ma, out, z=3, chon=None):
    d, img = nap(os.path.join(CUSTOM, ma + '.sprite.json'))
    net = d.get('net') or 1
    kw, kh = d['khung_rong'] * net, d['khung_cao'] * net
    gx, gy = [v * net for v in d['goc']]
    dts = [(k, v) for k, v in d['dong_tac'].items() if not chon or k in chon]
    so = max(v['so'] for _, v in dts)
    W = so * (kw * z + 4) + 90
    H = len(dts) * (kh * z + 4)
    can = Image.new('RGB', (W, H), (60, 64, 72))
    dr = ImageDraw.Draw(can)
    for r, (k, v) in enumerate(dts):
        y0 = r * (kh * z + 4)
        dr.text((4, y0 + 4), k, fill=(255, 255, 255))
        for i in range(v['so']):
            o = Image.fromarray(img[v['hang'] * kh:(v['hang'] + 1) * kh, i * kw:(i + 1) * kw])
            x0 = 90 + i * (kw * z + 4)
            nen = Image.new('RGBA', (kw, kh), (150, 160, 150, 255))
            nen.alpha_composite(o)
            can.paste(nen.resize((kw * z, kh * z), Image.NEAREST), (x0, y0))
            dr.line([x0, y0 + gy * z, x0 + kw * z, y0 + gy * z], fill=(255, 0, 0))
            dr.line([x0 + gx * z, y0, x0 + gx * z, y0 + kh * z], fill=(0, 90, 255))
            dr.text((x0 + 2, y0 + 2), str(i + 1), fill=(0, 0, 0))
    can.save(out)
    return out


if __name__ == '__main__':
    ve(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 3,
       sys.argv[4].split(',') if len(sys.argv) > 4 else None)
